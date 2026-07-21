# TODO

- Migrar o rate limit do leitor de preço (`api/scan-price.ts`) de contador em memória pra Vercel Runtime Cache (`getCache()` de `@vercel/functions`), se o tráfego crescer. Hoje o limite (5 req/min por IP) é só por instância — reseta em cold start e não é compartilhado entre regiões, então é proteção básica contra abuso de um IP só, não um limite 100% preciso. O Runtime Cache resolveria isso com um limite de verdade distribuído, mas tem custo de uso associado.
