# Design System - Marcenaria PRO

Este documento serve como referência para os padrões visuais e componentes utilizados no sistema Marcenaria PRO.

## Cores

### Cores Principais

| Nome | Valor | Uso |
|------|-------|-----|
| **Primária** | `#70645C` (marrom) | Botões principais, elementos de destaque, ícones ativos |
| **Primária Hover** | `#5d534c` | Estado hover em botões primários |
| **Primária Light** | `#70645C/10` | Backgrounds de elementos ativos, hover de botões secundários |
| **Background** | `#f9fafb` (cinza claro) | Fundo da aplicação |
| **Foreground** | `#0f172a` (quase preto) | Texto principal |
| **White** | `#ffffff` | Texto em botões primários, fundos de cards |

### Cores Secundárias

| Nome | Valor | Uso |
|------|-------|-----|
| **Muted** | `#475569` | Texto secundário, ícones inativos |
| **Border** | `#e5e7eb` | Bordas de cards, inputs e elementos de UI |
| **Input** | `#e5e7eb` | Bordas de inputs |
| **Success** | `#16a34a` | Indicadores de sucesso, badges "ativo" |
| **Warning** | Amarelo (yellow-600) | Indicadores de atenção, status "pendente" |
| **Destructive** | `#dc2626` | Botões de ações destrutivas, mensagens de erro |

## Tipografia

- **Família de fonte**: Inter (sans-serif)
- **Pesos utilizados**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

### Tamanhos

| Elemento | Tamanho | Peso | Cor |
|----------|---------|------|-----|
| H1 (Títulos principais) | text-3xl (30px) ou text-4xl (36px) | font-bold | text-[#0f172a] |
| H2 (Subtítulos) | text-2xl (24px) | font-semibold | text-[#0f172a] |
| H3 (Títulos de cards) | text-lg (18px) | font-medium | text-[#0f172a] ou text-[#70645C] |
| Corpo de texto | text-base (16px) | font-normal | text-[#0f172a] |
| Texto secundário | text-sm (14px) | font-normal | text-[#475569] |
| Labels | text-sm (14px) | font-medium | text-[#0f172a] |
| Botões | text-sm (14px) | font-medium | Depende do botão |

## Espaçamento

- **Base**: 4px (0.25rem)
- **Container padding**: 2rem (32px)
- **Gap entre elementos**: 
  - Pequeno: 0.5rem (8px) ou 1rem (16px)
  - Médio: 1.5rem (24px)
  - Grande: 2rem (32px) ou mais

## Componentes

### Botões

#### Primário

```jsx
<Button 
  className="bg-[#70645C] hover:bg-[#5d534c] text-white border border-[#70645C]/20"
>
  Botão Primário
</Button>
```

#### Secundário / Outline

```jsx
<Button 
  variant="outline"
  className="border-[#70645C] text-[#70645C] hover:bg-[#70645C]/10"
>
  Botão Secundário
</Button>
```

#### Variantes de Tamanho

- **Padrão**: h-10 px-4 py-2
- **Pequeno**: h-9 rounded-md px-3 (variant="sm")
- **Grande**: h-11 rounded-md px-8 (variant="lg")

#### Botão Destrutivo

```jsx
<Button 
  variant="outline" 
  className="border-red-200 text-red-500 hover:bg-red-50"
>
  Ação Destrutiva
</Button>
```

### Cards

```jsx
<Card className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
  <CardHeader className="bg-[#70645C]/5 border-b border-gray-100">
    <CardTitle className="text-[#70645C] flex items-center">
      <Icon className="mr-2 h-5 w-5" /> Título do Card
    </CardTitle>
    <CardDescription>
      Descrição opcional do card
    </CardDescription>
  </CardHeader>
  <CardContent className="p-6">
    {/* Conteúdo do card */}
  </CardContent>
  <CardFooter>
    {/* Rodapé opcional com ações */}
  </CardFooter>
</Card>
```

### Inputs

```jsx
<div className="space-y-2">
  <Label htmlFor="input-id" className="text-[#0f172a] text-sm font-medium">
    Label do Input
  </Label>
  <Input
    id="input-id"
    className="h-11 border-[#e5e7eb] focus:border-[#70645C] focus:ring focus:ring-[#70645C] focus:ring-opacity-20"
    placeholder="Placeholder do input"
  />
</div>
```

### Badges

#### Badge de Status

```jsx
<Badge className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
  Ativo
</Badge>

<Badge className="bg-yellow-100 text-yellow-600 text-xs px-2 py-0.5 rounded-full font-medium">
  Pendente
</Badge>

<Badge className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-medium">
  Inativo
</Badge>
```

#### Badge de Função (Role)

```jsx
<Badge className="bg-purple-100 text-purple-800 border-purple-200 flex items-center gap-1">
  <Shield size={12} /> Administrador
</Badge>

<Badge className="bg-blue-100 text-blue-800 border-blue-200">
  Colaborador
</Badge>
```

### Navegação

#### Item de Menu Ativo

```jsx
<Link
  href="/caminho"
  className="flex items-center px-4 py-3 text-sm font-medium rounded-lg bg-[#70645C]/10 text-[#70645C]"
>
  <Icon size={18} className="mr-3 text-[#70645C]" />
  Item ativo
</Link>
```

#### Item de Menu Inativo

```jsx
<Link
  href="/caminho"
  className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-[#475569] hover:bg-gray-100"
>
  <Icon size={18} className="mr-3 text-[#475569]" />
  Item inativo
</Link>
```

## Layout

### Container

```jsx
<div className="container mx-auto px-4 sm:px-6 lg:px-8">
  {/* Conteúdo */}
</div>
```

### Grid Responsivo

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Cards ou outros elementos */}
</div>
```

### Estrutura da Página do Dashboard

```jsx
<div className="flex flex-col h-full bg-gray-50">
  <div className="flex flex-col gap-6 container py-8">
    {/* Cabeçalho da página */}
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-[#70645C]">Título da Página</h1>
        <p className="text-gray-500">Descrição da página</p>
      </div>
      {/* Elementos adicionais do cabeçalho, como badges ou actions */}
    </div>
    
    {/* Conteúdo principal */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Conteúdo principal (largura dupla em telas grandes) */}
      <div className="lg:col-span-2 space-y-6">
        {/* Cards ou outros elementos */}
      </div>
      
      {/* Sidebar (largura simples) */}
      <div className="space-y-6">
        {/* Cards ou outros elementos secundários */}
      </div>
    </div>
  </div>
</div>
```

## Formulários

### Formulário Padrão

```jsx
<form className="space-y-6">
  <div className="space-y-2">
    <Label htmlFor="campo1" className="text-[#0f172a] text-sm font-medium">
      Campo 1
    </Label>
    <Input
      id="campo1"
      name="campo1"
      className="h-11 border-[#e5e7eb] focus:border-[#70645C] focus:ring focus:ring-[#70645C] focus:ring-opacity-20"
      placeholder="Placeholder"
    />
    {/* Mensagem de erro opcional */}
    {error && <p className="text-[#dc2626] text-sm mt-1">{error}</p>}
  </div>
  
  {/* Mais campos */}
  
  <Button
    type="submit"
    className="w-full h-11 bg-[#70645C] hover:bg-[#5d534c] text-white font-medium rounded-lg"
    disabled={loading}
  >
    {loading ? "Enviando..." : "Enviar"}
  </Button>
</form>
```

## Mensagens de Aviso

### Mensagem de Erro

```jsx
<div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
  Mensagem de erro
</div>
```

### Mensagem de Sucesso

```jsx
<div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-600 rounded-lg text-sm">
  Mensagem de sucesso
</div>
```

### Mensagem de Aviso

```jsx
<div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 text-yellow-600 rounded-lg text-sm">
  Mensagem de aviso
</div>
```

## Ícones

O sistema utiliza ícones da biblioteca Lucide (https://lucide.dev/). Os ícones são geralmente utilizados com:

- Tamanho padrão: 18px a 24px
- Cor correspondente ao contexto (geralmente text-[#70645C] para ícones destacados ou text-[#475569] para ícones secundários)

```jsx
<Icon size={18} className="text-[#70645C]" />
```

## Responsividade

O sistema utiliza as seguintes quebras de layout:

- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1400px

## Animações e Transições

- Transição de cores em hover: `transition-colors`
- Duração padrão: 300ms
- Timing function: ease-in-out

```jsx
<div className="transition-colors duration-300 ease-in-out">
  {/* Conteúdo */}
</div>
```

---

Este guia deve ser utilizado como referência para manter a consistência visual em todo o sistema Marcenaria PRO. Todos os novos componentes devem seguir essas diretrizes. 