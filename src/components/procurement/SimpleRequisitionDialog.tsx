import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

interface SimpleRequisitionForm {
    project_id: string
    required_date: Date
    justification: string
    items: {
        material_id: string
        quantity: number
    }[]
}

export function SimpleRequisitionDialog({ onRequisitionCreated }: { onRequisitionCreated: () => void }) {
    const [open, setOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<SimpleRequisitionForm>({
        defaultValues: {
            project_id: "",
            justification: "",
            items: [{ material_id: "", quantity: 1 }]
        }
    })

    async function onSubmit(values: SimpleRequisitionForm) {
        setIsSubmitting(true)
        try {
            console.log('Form submitted:', values)
            // Simulate successful submission
            toast.success('Requisition created successfully')
            setOpen(false)
            form.reset()
            onRequisitionCreated()
        } catch (error) {
            console.error('Submit error:', error)
            toast.error('Failed to create requisition')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div>
            <button onClick={() => setOpen(true)}>
                Open Simple Requisition Form
            </button>
            {open && (
                <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
                    <h3>Simple Requisition Form</h3>
                    <div>
                        <div>
                            <label>Project ID:</label>
                            <input
                                value={form.watch('project_id')}
                                onChange={(e) => form.setValue('project_id', e.target.value)}
                                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                            />
                        </div>
                        <div>
                            <label>Justification:</label>
                            <textarea
                                value={form.watch('justification')}
                                onChange={(e) => form.setValue('justification', e.target.value)}
                                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                            />
                        </div>
                        <div>
                            <label>Items:</label>
                            <div>
                                {form.watch('items')?.map((item: { material_id: string, quantity: number }, index: number) => (
                                    <div key={index} style={{ marginBottom: '8px' }}>
                                        <input
                                            value={item.material_id}
                                            onChange={(e) => {
                                                const newItems = [...form.watch('items')]
                                                newItems[index] = { ...newItems[index], material_id: e.target.value }
                                                form.setValue(`items.${index}.material_id`, e.target.value)
                                            }}
                                            style={{ width: '100%', padding: '4px', border: '1px solid #ddd', borderRadius: '4px' }}
                                        />
                                        <input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => {
                                                const newItems = [...form.watch('items')]
                                                newItems[index] = { ...newItems[index], quantity: e.target.valueAsNumber }
                                                form.setValue(`items.${index}.quantity`, e.target.valueAsNumber)
                                            }}
                                            style={{ width: '80px', padding: '4px', border: '1px solid #ddd', borderRadius: '4px' }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newItems = form.watch('items').filter((_: unknown, i: number) => i !== index)
                                                form.setValue('items', newItems)
                                            }}
                                            style={{ padding: '4px 8px', backgroundColor: '#ef4444', border: 'none', borderRadius: '4px' }}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <button
                            type="submit"
                            onClick={form.handleSubmit(onSubmit)}
                            disabled={isSubmitting}
                            style={{ marginTop: '16px' }}
                        >
                            {isSubmitting ? 'Creating...' : 'Submit Simple Requisition'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
