import { useEffect } from 'react';

const SITE_NAME = 'aristo';

export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title
      ? `${title} - ${SITE_NAME}`
      : `${SITE_NAME} - 食虫植物 素人栽培 備忘録`;
  }, [title]);
}
