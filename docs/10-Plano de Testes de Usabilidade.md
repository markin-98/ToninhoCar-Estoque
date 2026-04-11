# Plano de Testes de Usabilidade

O Plano de Testes de Usabilidade do projeto **Toninho Car Estoque** tem como objetivo avaliar se a interface da aplicação é fácil de entender, simples de utilizar e adequada à rotina da mecânica. O foco principal dos testes será verificar se os usuários conseguem executar as funções mais importantes do sistema com clareza, agilidade e baixo índice de erro.

Os testes serão realizados com base nas funcionalidades centrais da aplicação, considerando os dois perfis principais de uso do sistema: **Administrador** e **Funcionário**. A avaliação será voltada para a experiência de uso em ambiente mobile, observando aspectos como facilidade de navegação, entendimento dos botões, clareza das informações exibidas, tempo para realização das tarefas e dificuldades encontradas durante a interação com o sistema.

## Objetivos dos testes

Os testes de usabilidade possuem os seguintes objetivos:

- verificar se os usuários conseguem compreender a interface sem necessidade de explicações excessivas;
- avaliar se as funções principais do sistema podem ser executadas com facilidade;
- identificar dificuldades de navegação, interpretação ou preenchimento de dados;
- medir a eficiência das tarefas principais do aplicativo;
- levantar sugestões de melhoria na interface e no fluxo de uso.

## Escopo dos testes

Os testes de usabilidade abrangerão as principais funcionalidades do sistema **Toninho Car Estoque**, especialmente aquelas ligadas à rotina da mecânica:

- realização de login;
- consulta de produtos e quantidades disponíveis;
- gerenciamento de produtos;
- gerenciamento de preços;
- registro de movimentações de estoque;
- gerenciamento da ficha do carro;
- consulta ao histórico de movimentações;
- verificação de alertas de estoque baixo;
- visualização de relatórios gerenciais.

## Perfis dos participantes

Os testes serão realizados com usuários que representem os perfis reais de uso do sistema:

| Perfil | Descrição |
|---|---|
| Administrador | Usuário responsável pela gestão do estoque, cadastro de produtos, preços e relatórios |
| Funcionário | Usuário responsável pela consulta de produtos, saída de itens e preenchimento da ficha do carro |

## Quantidade de participantes

Serão convidados entre **3 e 5 participantes**, buscando representar os perfis mais próximos do uso real do sistema. A escolha desse número visa permitir observação qualitativa suficiente para identificar problemas de usabilidade sem tornar o processo excessivamente complexo.

## Ambiente de teste

Os testes serão realizados em ambiente controlado, utilizando dispositivo móvel compatível com a proposta da aplicação. O ambiente deve permitir ao participante executar as tarefas com tranquilidade, sem interrupções externas que prejudiquem a observação.

| Item | Descrição |
|---|---|
| Dispositivo | Smartphone ou ambiente simulando uso mobile |
| Conexão | Internet estável, quando necessário |
| Local | Ambiente silencioso e controlado |
| Registro | Observação do avaliador e anotações das dificuldades encontradas |

## Critérios de avaliação

Durante os testes, serão observados os seguintes critérios:

- facilidade de aprendizado;
- clareza dos elementos da interface;
- tempo gasto para concluir cada tarefa;
- quantidade de erros cometidos;
- necessidade de ajuda externa;
- satisfação do usuário ao final do teste.

## Métricas de usabilidade

As seguintes métricas serão utilizadas para avaliar os resultados:

| Métrica | Descrição |
|---|---|
| Taxa de sucesso | Percentual de tarefas concluídas corretamente |
| Tempo de execução | Tempo necessário para completar cada tarefa |
| Número de erros | Quantidade de erros cometidos durante a execução |
| Necessidade de ajuda | Quantidade de vezes em que o participante precisou de orientação |
| Satisfação do usuário | Percepção geral do participante sobre facilidade e clareza do sistema |

## Casos de teste de usabilidade

| ID | Funcionalidade | Tarefa do usuário | Resultado esperado |
|---|---|---|---|
| TU-01 | Login | Acessar o sistema com seu perfil | O usuário deve conseguir entrar no sistema sem dificuldade |
| TU-02 | Consulta de produtos | Localizar um produto e verificar sua quantidade disponível | O usuário deve encontrar o item rapidamente e compreender as informações exibidas |
| TU-03 | Gerenciamento de produtos | Cadastrar ou editar um produto no sistema | O administrador deve conseguir realizar o cadastro ou alteração com clareza |
| TU-04 | Gerenciamento de preços | Cadastrar ou alterar o preço de um produto | O administrador deve conseguir atualizar o valor corretamente |
| TU-05 | Movimentação de estoque | Registrar entrada ou saída de produto | O usuário deve concluir a movimentação sem erros |
| TU-06 | Ficha do carro | Criar ou consultar a ficha de um veículo | O funcionário deve conseguir relacionar os itens ao veículo atendido |
| TU-07 | Histórico | Consultar o histórico de movimentações | O administrador deve localizar as informações com facilidade |
| TU-08 | Alerta de estoque baixo | Identificar item com necessidade de reposição | O administrador deve compreender rapidamente o alerta apresentado |
| TU-09 | Relatórios | Visualizar relatório gerencial do estoque | O administrador deve interpretar as informações do relatório com clareza |

## Procedimento de execução

A aplicação dos testes seguirá as etapas abaixo:

1. apresentar brevemente o objetivo do teste ao participante;
2. informar que o sistema está em avaliação e que o foco é a interface, não o desempenho pessoal do usuário;
3. solicitar que o participante execute as tarefas definidas;
4. observar a navegação, registrar dúvidas, erros, hesitações e comentários;
5. coletar a percepção final do participante sobre a experiência de uso.

## Critérios de sucesso

Os testes serão considerados satisfatórios quando:

- a maioria dos participantes conseguir concluir as tarefas principais;
- o tempo de execução estiver dentro de um nível aceitável para uso cotidiano;
- a quantidade de erros for baixa;
- os participantes relatarem facilidade de entendimento e navegação;
- os problemas identificados puderem ser corrigidos com ajustes de interface e fluxo.
