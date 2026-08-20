# Migração Flutter para React Native

O aplicativo React Native mantém as jornadas principais do Smart HAS/MediStock: abertura, login, cadastro, confirmação de matrícula, dashboard, alertas, estoque, IA e logística. A navegação usa React Navigation com uma pilha para autenticação e abas para as áreas operacionais.

## Valor da migração

- Uma única base TypeScript atende Android, iOS e web, reduzindo duplicação e custo de manutenção.
- Componentes React Native (`View`, `Text`, `Image`, `Pressable`/`Button`) são reutilizáveis e preservam a experiência do app Flutter.
- A camada `src/services/api.ts` centraliza o acesso seguro à API REST, incluindo JWT no cabeçalho `Authorization` e mensagens de erro do servidor.
- O estado de sessão usa AsyncStorage para manter o acesso após reabrir o aplicativo.

## Integração com o Spring Boot

Copie `.env.example` para `.env` e ajuste `EXPO_PUBLIC_API_URL`. Em um celular físico, `localhost` não aponta para o computador; use o IP local da máquina e mantenha ambos na mesma rede.

O cadastro envia nome, e-mail institucional e senha, como no Flutter. O backend compatível completa matrícula, setor, cargo, hospital e perfil padrão de forma controlada. A senha deve ter ao menos oito caracteres.
