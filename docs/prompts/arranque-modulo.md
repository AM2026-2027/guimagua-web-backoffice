# Prompt de arranque de módulo (para agentes sem o comando `/novo-modulo`)

No Claude Code usa `/novo-modulo <modulo>`. Noutros agentes (ex.: Gemini), cola o texto abaixo e preenche os campos entre `[ ]`.

---

Vamos planear o módulo **[clients | team | services-catalog | inventory | dashboard | tickets | agenda | reports]** do Backoffice Web Guimágua Smart Pool. Pertenço ao **Grupo [A | B]**.

Nesta fase **não cries nem edites ficheiros**.

1. Lê o `AGENTS.md` por inteiro e segue-o.
2. Em `docs/modulos.md`, encontra este módulo e lê só a documentação indicada: os ecrãs (abre as imagens PNG dos protótipos), a spec `implementacao/`, os RF/US, `docs/modelo-dados.md`, as validações do dicionário de dados e `docs/decisoes.md`. Os nomes de coleções das specs antigas podem estar desatualizados: prevalece `docs/modelo-dados.md`.
3. Inspeciona `src/App.jsx`, `src/constants/`, `src/shared/components/`, `src/layout/`, `src/features/[pasta]/` e o serviço do módulo.
4. Corre `git branch --show-current` e `git status --short`. Se não estiver num branch `feat/[a|b]-[modulo]`, indica os comandos exatos para o criar a partir de `grupo-[a|b]`, sem os executar.
5. Apresenta o plano com:
   - resumo do módulo;
   - ficheiros por camada;
   - coleções e campos (existentes vs. **campo novo — validar com a equipa Android**) e validações;
   - estratégia de leitura no Firestore com estimativa de leituras (plano Spark);
   - discrepâncias entre protótipo, spec, requisitos e modelo;
   - dúvidas com sugestão;
   - ficheiros partilhados afetados ("nenhum", se for o caso).
6. Pára e espera a minha aprovação.

Notas adicionais deste ecrã (opcional): [ ]
