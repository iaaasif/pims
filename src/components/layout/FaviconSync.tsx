import { useEffect } from 'react';
import { useCompanyInformation } from '@/hooks/useCompanyInformation';

export function FaviconSync() {
    const { company } = useCompanyInformation();

    useEffect(() => {
        if (company?.logo_url) {
            const link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
            if (link) {
                link.href = company.logo_url;
            } else {
                const newLink = document.createElement('link');
                newLink.rel = 'icon';
                newLink.href = company.logo_url;
                document.head.appendChild(newLink);
            }
        }
    }, [company?.logo_url]);

    useEffect(() => {
        const siteTitle = company?.site_title || 'PIMS';
        if (company?.company_name) {
            document.title = `${siteTitle} | ${company.company_name}`;
        } else {
            document.title = siteTitle;
        }
    }, [company?.company_name, company?.site_title]);

    return null;
}
