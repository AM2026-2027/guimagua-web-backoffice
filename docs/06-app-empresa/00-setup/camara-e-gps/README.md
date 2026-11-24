# B: Setup de Interfaces Nativas (Câmara e GPS)

| Campo | Valor |
|---|---|
| Card Trello | #111 — [abrir no Trello](https://trello.com/c/LnhsOnjS) |
| Lista / Sprint | Sprint Backlog B |
| Etiquetas | APP, Frontend |
| Responsáveis | Simão Costa, Rui Filipe Rodrigues Sousa |
| Última atividade | 2026-11-21 |

## Descrição

- Configurar as permissões e bibliotecas nativas do Android que ambas as vertentes (Técnico e Comercial) vão utilizar intensivamente.
- **Critérios de Aceitação:**
  - Adicionar no `AndroidManifest.xml` as permissões de `CAMERA`, `ACCESS_FINE_LOCATION` e `INTERNET`.
  - Implementar um módulo genérico utilizando a biblioteca `CameraX` para captura e compressão das fotografias (reutilizável na checklist e nos levantamentos de obra).
