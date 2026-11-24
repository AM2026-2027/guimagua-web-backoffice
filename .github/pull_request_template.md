## Resumo
<!-- O que muda e porquê. -->

**Módulo / grupo:** <!-- ex.: clients / Grupo B -->
**PR para:** <!-- grupo-a | grupo-b | main (só chore/ ou grupo → main) -->

## Ecrãs, requisitos e user stories cobertos
<!-- ex.: Lista de Clientes (#64), Modal Novo Cliente (#65) · RF-WEB01 · US01 -->

## Dados (Firestore)
<!-- Coleções lidas/escritas. Destacar os campos NOVOS que não estão em docs/modelo-dados.md (validar com a equipa Android). -->

## Como testar
1.

## Definição de feito
- [ ] Branch `feat/a-*` / `feat/b-*` criado a partir do branch do grupo atualizado com a `main`
- [ ] Quatro camadas respeitadas; nenhum import de `firebase/*` fora de `src/services/`
- [ ] Coleções e campos conforme `docs/modelo-dados.md` (campos novos listados acima)
- [ ] Código em inglês, comentários e UI em PT-PT, tema Guimágua
- [ ] `npm run lint` e `npm run build` sem erros nem avisos (CI verde)
- [ ] Fluxos principais testados contra o Firebase real
- [ ] Sem `.env.local` nem alterações não autorizadas a ficheiros partilhados
