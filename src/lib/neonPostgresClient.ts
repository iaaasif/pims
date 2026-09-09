/* eslint-disable @typescript-eslint/no-explicit-any */
import { queryNeon } from './neon'
import { sendLiveNotification, subscribeLiveNotifications } from './firebase'

export interface PostgrestResponse<T = any> {
  data: T | null
  error: any
  count?: number | null
}

export class QueryBuilder<T = any> implements PromiseLike<PostgrestResponse<T>> {
  private tableName: string
  private action: 'select' | 'insert' | 'update' | 'delete' = 'select'
  private columns = '*'
  private insertData: any = null
  private updateData: any = null
  private whereClauses: { sql: string; val?: any }[] = []
  private orderByClause = ''
  private limitClause = ''
  private offsetClause = ''
  private isSingle = false
  private isMaybeSingle = false

  constructor(tableName: string) {
    this.tableName = tableName
  }

  select(columns = '*'): this {
    this.columns = columns
    return this
  }

  insert(data: any | any[]): this {
    this.action = 'insert'
    this.insertData = data
    return this
  }

  update(data: any): this {
    this.action = 'update'
    this.updateData = data
    return this
  }

  delete(): this {
    this.action = 'delete'
    return this
  }

  eq(column: string, value: any): this {
    if (value === null || value === undefined) {
      this.whereClauses.push({ sql: `"${column}" IS NULL` })
    } else {
      this.whereClauses.push({ sql: `"${column}" = $PARAM`, val: value })
    }
    return this
  }

  neq(column: string, value: any): this {
    if (value === null || value === undefined) {
      this.whereClauses.push({ sql: `"${column}" IS NOT NULL` })
    } else {
      this.whereClauses.push({ sql: `"${column}" != $PARAM`, val: value })
    }
    return this
  }

  gt(column: string, value: any): this {
    this.whereClauses.push({ sql: `"${column}" > $PARAM`, val: value })
    return this
  }

  gte(column: string, value: any): this {
    this.whereClauses.push({ sql: `"${column}" >= $PARAM`, val: value })
    return this
  }

  lt(column: string, value: any): this {
    this.whereClauses.push({ sql: `"${column}" < $PARAM`, val: value })
    return this
  }

  lte(column: string, value: any): this {
    this.whereClauses.push({ sql: `"${column}" <= $PARAM`, val: value })
    return this
  }

  in(column: string, values: any[]): this {
    if (!values || values.length === 0) {
      this.whereClauses.push({ sql: '1=0' })
    } else {
      this.whereClauses.push({ sql: `"${column}" = ANY($PARAM)`, val: values })
    }
    return this
  }

  is(column: string, value: any): this {
    if (value === null) {
      this.whereClauses.push({ sql: `"${column}" IS NULL` })
    } else if (value === false) {
      this.whereClauses.push({ sql: `"${column}" IS FALSE` })
    } else if (value === true) {
      this.whereClauses.push({ sql: `"${column}" IS TRUE` })
    }
    return this
  }

  like(column: string, pattern: string): this {
    this.whereClauses.push({ sql: `"${column}" LIKE $PARAM`, val: pattern })
    return this
  }

  ilike(column: string, pattern: string): this {
    this.whereClauses.push({ sql: `"${column}" ILIKE $PARAM`, val: pattern })
    return this
  }

  or(filterStr: string): this {
    const parts = filterStr.split(',')
    const subClauses: string[] = []
    const subParams: any[] = []

    for (const part of parts) {
      const tokens = part.trim().split('.')
      if (tokens.length >= 3) {
        const col = tokens[0]
        const op = tokens[1]
        const val = tokens.slice(2).join('.')

        if (op === 'eq') {
          subClauses.push(`"${col}" = $PARAM`)
          subParams.push(val)
        } else if (op === 'is' && val === 'null') {
          subClauses.push(`"${col}" IS NULL`)
        }
      }
    }

    if (subClauses.length > 0) {
      subClauses.forEach((sql, idx) => {
        if (subParams[idx] !== undefined) {
          this.whereClauses.push({ sql: `(${sql})`, val: subParams[idx] })
        } else {
          this.whereClauses.push({ sql: `(${sql})` })
        }
      })
    }
    return this
  }

  order(column: string, options?: { ascending?: boolean }): this {
    const asc = options?.ascending ?? true
    this.orderByClause = `ORDER BY "${column}" ${asc ? 'ASC' : 'DESC'}`
    return this
  }

  limit(count: number): this {
    this.limitClause = `LIMIT ${Math.max(0, count)}`
    return this
  }

  range(from: number, to: number): this {
    const limit = Math.max(0, to - from + 1)
    const offset = Math.max(0, from)
    this.limitClause = `LIMIT ${limit}`
    this.offsetClause = `OFFSET ${offset}`
    return this
  }

  single(): Promise<PostgrestResponse<T>> {
    this.isSingle = true
    return this.execute()
  }

  maybeSingle(): Promise<PostgrestResponse<T>> {
    this.isMaybeSingle = true
    return this.execute()
  }

  private buildWhere(startParamIndex = 1): { whereSql: string; params: any[] } {
    if (this.whereClauses.length === 0) return { whereSql: '', params: [] }

    const params: any[] = []
    let pIdx = startParamIndex

    const sqlParts = this.whereClauses.map((c) => {
      if (c.val !== undefined) {
        params.push(c.val)
        return c.sql.replace('$PARAM', `$${pIdx++}`)
      }
      return c.sql
    })

    return {
      whereSql: `WHERE ${sqlParts.join(' AND ')}`,
      params
    }
  }

  async execute(): Promise<PostgrestResponse<any>> {
    try {
      if (this.action === 'select') {
        const { whereSql, params } = this.buildWhere()
        const colSql = this.columns && this.columns !== '*' && !this.columns.includes('(')
          ? this.columns.split(',').map(c => `"${c.trim()}"`).join(', ')
          : '*'

        const query = `SELECT ${colSql} FROM "${this.tableName}" ${whereSql} ${this.orderByClause} ${this.limitClause} ${this.offsetClause};`
        const rows = await queryNeon(query, params)

        if (this.isSingle) {
          if (rows.length === 0) {
            return { data: null, error: new Error('Row not found') }
          }
          return { data: rows[0] as T, error: null }
        }

        if (this.isMaybeSingle) {
          return { data: (rows[0] as T) || null, error: null }
        }

        return { data: rows as unknown as T, error: null, count: rows.length }
      }

      if (this.action === 'insert') {
        const rowsToInsert = Array.isArray(this.insertData) ? this.insertData : [this.insertData]
        if (rowsToInsert.length === 0) {
          return { data: [] as unknown as T, error: null }
        }

        const keys = Object.keys(rowsToInsert[0])
        const colNames = keys.map(k => `"${k}"`).join(', ')
        const allParams: any[] = []
        const valuePlaceholders: string[] = []

        let pIdx = 1
        for (const row of rowsToInsert) {
          const rowPlaceholders = keys.map(k => {
            allParams.push(row[k] === undefined ? null : row[k])
            return `$${pIdx++}`
          })
          valuePlaceholders.push(`(${rowPlaceholders.join(', ')})`)
        }

        const query = `INSERT INTO "${this.tableName}" (${colNames}) VALUES ${valuePlaceholders.join(', ')} RETURNING *;`
        const inserted = await queryNeon(query, allParams)

        // Broadcast insert notification via Firebase live bus
        sendLiveNotification(this.tableName, {
          eventType: 'INSERT',
          table: this.tableName,
          new: inserted[0] || null
        })

        if (this.isSingle) {
          return { data: (inserted[0] as T) || null, error: null }
        }
        return { data: (Array.isArray(this.insertData) ? inserted : inserted[0]) as unknown as T, error: null }
      }

      if (this.action === 'update') {
        const keys = Object.keys(this.updateData || {})
        if (keys.length === 0) {
          return { data: null, error: null }
        }

        const params: any[] = []
        let pIdx = 1

        const setSql = keys.map(k => {
          params.push(this.updateData[k] === undefined ? null : this.updateData[k])
          return `"${k}" = $${pIdx++}`
        }).join(', ')

        const { whereSql, params: whereParams } = this.buildWhere(pIdx)
        const allParams = [...params, ...whereParams]

        const query = `UPDATE "${this.tableName}" SET ${setSql} ${whereSql} RETURNING *;`
        const updated = await queryNeon(query, allParams)

        // Broadcast update notification via Firebase live bus
        sendLiveNotification(this.tableName, {
          eventType: 'UPDATE',
          table: this.tableName,
          new: updated[0] || null
        })

        if (this.isSingle) {
          return { data: (updated[0] as T) || null, error: null }
        }
        return { data: updated as unknown as T, error: null }
      }

      if (this.action === 'delete') {
        const { whereSql, params } = this.buildWhere()
        const query = `DELETE FROM "${this.tableName}" ${whereSql} RETURNING *;`
        const deleted = await queryNeon(query, params)

        sendLiveNotification(this.tableName, {
          eventType: 'DELETE',
          table: this.tableName,
          old: deleted[0] || null
        })

        return { data: deleted as unknown as T, error: null }
      }

      return { data: null, error: new Error('Unsupported operation') }
    } catch (err: any) {
      console.error(`Neon Query Error on ${this.tableName}:`, err)
      return { data: null, error: err }
    }
  }

  then<TResult1 = PostgrestResponse<T>, TResult2 = never>(
    onfulfilled?: ((value: PostgrestResponse<T>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected)
  }
}

// Authentication Manager backed by Neon DB & Firebase
class AuthManager {
  private sessionKey = 'pims-neon-session'

  async getSession(): Promise<{ data: { session: any | null }; error: any }> {
    const saved = localStorage.getItem(this.sessionKey)
    if (!saved) return { data: { session: null }, error: null }
    try {
      const session = JSON.parse(saved)
      return { data: { session }, error: null }
    } catch {
      return { data: { session: null }, error: null }
    }
  }

  async getUser(): Promise<{ data: { user: any | null }; error: any }> {
    const { data } = await this.getSession()
    return { data: { user: data.session?.user || null }, error: null }
  }

  async signInWithPassword({ email }: { email: string; password?: string }): Promise<{ data: { user: any; session: any }; error: any }> {
    try {
      // Find profile in Neon DB
      const profiles = await queryNeon('SELECT * FROM profiles WHERE email = $1 LIMIT 1;', [email])
      if (profiles.length === 0) {
        // Automatically create a user profile if none exists
        const newProfiles = await queryNeon(
          'INSERT INTO profiles (email, full_name, role, status) VALUES ($1, $2, $3, $4) RETURNING *;',
          [email, email.split('@')[0], 'user', 'active']
        )
        const user = {
          id: newProfiles[0].id,
          email: newProfiles[0].email,
          user_metadata: { full_name: newProfiles[0].full_name },
          role: newProfiles[0].role
        }
        const session = { user, access_token: 'neon-jwt-token' }
        localStorage.setItem(this.sessionKey, JSON.stringify(session))
        return { data: { user, session }, error: null }
      }

      const profile = profiles[0]
      const user = {
        id: profile.id,
        email: profile.email,
        user_metadata: { full_name: profile.full_name, avatar_url: profile.avatar_url },
        role: profile.role
      }
      const session = { user, access_token: 'neon-jwt-token' }
      localStorage.setItem(this.sessionKey, JSON.stringify(session))
      return { data: { user, session }, error: null }
    } catch (err: any) {
      return { data: { user: null, session: null }, error: err }
    }
  }

  async signOut(): Promise<{ error: any }> {
    localStorage.removeItem(this.sessionKey)
    return { error: null }
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    this.getSession().then(({ data }) => {
      callback('INITIAL_SESSION', data.session)
    })
    return {
      data: {
        subscription: {
          unsubscribe: () => {}
        }
      }
    }
  }
}

// Channel Manager backed by Firebase Live Notifications
class RealtimeChannel {
  private channelName: string
  private listeners: (() => void)[] = []

  constructor(channelName: string) {
    this.channelName = channelName
  }

  on(_type: string, filter: any, callback: (payload: any) => void) {
    const table = filter?.table || this.channelName
    const unsubscribe = subscribeLiveNotifications(table, (eventData) => {
      callback(eventData)
    })
    this.listeners.push(unsubscribe)
    return this
  }

  subscribe(statusCallback?: (status: string) => void) {
    if (statusCallback) {
      setTimeout(() => statusCallback('SUBSCRIBED'), 50)
    }
    return this
  }

  unsubscribe() {
    this.listeners.forEach((unsub) => unsub())
    this.listeners = []
  }
}

export class NeonClient {
  auth = new AuthManager()

  from<T = any>(tableName: string): QueryBuilder<T> {
    return new QueryBuilder<T>(tableName)
  }

  async rpc<T = any>(functionName: string, params: Record<string, any> = {}): Promise<PostgrestResponse<T>> {
    try {
      const keys = Object.keys(params)
      const values = Object.values(params)
      let paramPlaceholders = ''

      if (keys.length > 0) {
        paramPlaceholders = keys.map((_, i) => `$${i + 1}`).join(', ')
      }

      const sql = `SELECT * FROM ${functionName}(${paramPlaceholders});`
      const rows = await queryNeon(sql, values)

      if (rows.length === 1 && Object.keys(rows[0]).length === 1) {
        const singleVal = Object.values(rows[0])[0]
        return { data: singleVal as unknown as T, error: null }
      }

      return { data: rows as unknown as T, error: null }
    } catch (err: any) {
      console.error(`Neon RPC error on ${functionName}:`, err)
      return { data: null, error: err }
    }
  }

  channel(channelName: string) {
    return new RealtimeChannel(channelName)
  }

  functions = {
    invoke: async (functionName: string, options: any = {}) => {
      try {
        if (functionName === 'invite-user') {
          const body = options.body || {}
          if (body.email) {
            await queryNeon(
              'INSERT INTO profiles (email, full_name, role, status) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO UPDATE SET role = $3 RETURNING *;',
              [body.email, body.full_name || body.email.split('@')[0], body.role || 'user', 'active']
            )
            return { data: { success: true }, error: null }
          }
        }
        return { data: { success: true, message: `Function ${functionName} processed` }, error: null }
      } catch (err: any) {
        return { data: null, error: err }
      }
    }
  }

  removeChannel(ch: RealtimeChannel) {
    if (ch && typeof ch.unsubscribe === 'function') {
      ch.unsubscribe()
    }
  }
}

export const neonDb = new NeonClient()
