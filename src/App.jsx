import { useState, useEffect, useRef } from "react";
import {
  Plane,
  Car,
  BedDouble,
  UtensilsCrossed,
  MapPin,
  FileText,
  Compass,
  CalendarDays,
  Star,
  ShieldCheck,
  RefreshCw,
  Clock,
  Phone,
  Mail,
  LifeBuoy,
  X,
  ExternalLink,
  MessageCircle,
  Siren,
  Banknote,
  CheckSquare,
  Square,
  Send,
  Globe,
  LogOut,
} from "lucide-react";

const C = {
  ink: "#241D14",
  bronze: "#976F32",
  bronzeDeep: "#6E4F22",
  blue: "#1F5C82",
  orange: "#C4631A",
  paper: "#F6F0E2",
  card: "#FFFBF2",
  gold: "#976F32",
  mist: "#E2D6BE",
  page: "#EAE3D2",
};

/* ------------------------------------------------------------------
 * LIGAÇÃO AO BACKEND
 * ------------------------------------------------------------------
 * IMPORTANTE: a app já NÃO fala diretamente com a Optitravel (isso exigia
 * colar aqui um token secreto, visível a qualquer pessoa que inspecione o
 * código no telemóvel). Em vez disso, fala com o nosso próprio backend
 * (ver pasta atropical-backend/), que guarda essas credenciais em
 * segurança e faz a verificação do código + nome do lado do servidor.
 * ------------------------------------------------------------------ */
const CONFIG = {
  BACKEND_URL: "https://atropicalapp.vercel.app",

  // Fontes pagas para o Guia (opcional). Se preenchidas, o Guia usa estes
  // dados oficiais com classificações reais em vez de pesquisa por IA.
  // Se ficarem vazias, o Guia recorre automaticamente a sites públicos
  // de turismo (sem custo, sem chave) — ver fetchGuideFromAI mais abaixo.
  TRIPADVISOR_API_KEY: "", // regista-te em tripadvisor.com/developers
  GOOGLE_PLACES_API_KEY: "", // regista-te em console.cloud.google.com (Places API)

  // Mostra a barra "a mostrar dados de exemplo" quando a Optitravel não
  // está ligada. Desliga isto quando o conteúdo estático já foi revisto
  // e confirmado como correto (como nesta viagem) — fica false por
  // predefinição. Volta a true quando quiseres deixar isso visível
  // (ex. durante testes internos).
  SHOW_FALLBACK_BANNER: false,
};

const CATEGORY_LABELS = {
  cultura: "Cultura",
  gastronomia: "Gastronomia",
  museus: "Museu",
  eventos: "Evento",
};

const GUIDE_FILTERS = [
  { key: "todos", label: "Tudo" },
  { key: "cultura", label: "Cultura" },
  { key: "gastronomia", label: "Gastronomia" },
  { key: "museus", label: "Museus" },
  { key: "eventos", label: "Eventos" },
];

/* ------------------------------------------------------------------
 * DADOS DE EXEMPLO — viagem real "Japão Fantástico" (15 a 25 de
 * agosto de 2026), tal como publicada em atropical.pt. Cada dia tem
 * o seu próprio campo "city": é essa cidade que define as sugestões
 * do Guia para esse dia (Tóquio, depois Quioto, Hiroshima, etc.).
 * ------------------------------------------------------------------ */
const MOCK_TRIP = {
  destination: "Japão Fantástico",
  country: "Japão",
  dates: "15 — 25 de Agosto 2026",
  flight: "",
  days: [
    {
      id: 1,
      city: "Tóquio",
      label: "Sáb-Dom",
      date: "15-16 Ago",
      title: "Partida e Chegada a Tóquio",
      activities: [
        { time: "10:40", icon: "plane", title: "Embarque no voo TK0198 Porto → Istambul → Tóquio", location: "Aeroporto do Porto", note: "Voo Turkish Airlines com escala em Istambul. Noite a bordo." },
        { time: "17:25", icon: "plane", title: "Chegada a Tóquio (16 Ago)", location: "Aeroporto de Tóquio", note: "Transfer privado até ao hotel, incluído no programa." },
        { time: "19:00", icon: "hotel", title: "Check-in no hotel em Tóquio", location: "Tóquio", note: "Primeira de três noites na capital japonesa." },
      ],
    },
    {
      id: 2,
      city: "Tóquio",
      label: "Seg",
      date: "17 Ago",
      title: "Tóquio em Pleno",
      activities: [
        { time: "09:30", icon: "map", title: "Bairros futuristas de Shibuya e Shinjuku", location: "Tóquio", note: "Contraste entre arranha-céus e a vida quotidiana japonesa." },
        { time: "15:00", icon: "map", title: "Templos tradicionais de Asakusa", location: "Asakusa, Tóquio", note: "Inclui o Templo Senso-ji e a rua comercial Nakamise." },
      ],
    },
    {
      id: 3,
      city: "Tóquio",
      label: "Ter",
      date: "18 Ago",
      title: "Monte Fuji e Kawaguchiko",
      activities: [
        { time: "08:30", icon: "car", title: "Transfer privado para a zona do Monte Fuji", location: "Tóquio", note: "Viagem de aproximadamente 2h." },
        { time: "11:00", icon: "map", title: "Pontos icónicos de Kawaguchiko", location: "Kawaguchiko", note: "Vistas sobre o Monte Fuji, tempo permitindo." },
        { time: "17:00", icon: "car", title: "Regresso a Tóquio", location: "Kawaguchiko", note: "Overnight em Tóquio." },
      ],
    },
    {
      id: 4,
      city: "Quioto",
      label: "Qua",
      date: "19 Ago",
      title: "De Tóquio a Quioto via Nara",
      activities: [
        { time: "08:00", icon: "car", title: "Transfer para a Estação de Shinagawa", location: "Tóquio", note: "Embarque no comboio-bala." },
        { time: "09:17", icon: "car", title: "Shinkansen Nozomi 225 Tóquio → Quioto", location: "Estação de Shinagawa", note: "Lugar reservado, 2ª classe." },
        { time: "13:00", icon: "map", title: "Paragem em Nara", location: "Nara", note: "Veados que circulam livremente pela cidade, junto aos templos." },
        { time: "18:00", icon: "hotel", title: "Check-in no hotel em Quioto", location: "Quioto", note: "Início de três noites na antiga capital imperial." },
      ],
    },
    {
      id: 5,
      city: "Quioto",
      label: "Qui",
      date: "20 Ago",
      title: "Quioto em Pleno",
      activities: [
        { time: "09:00", icon: "map", title: "Bairro de Gion", location: "Quioto", note: "O famoso bairro das gueixas e maikos." },
        { time: "11:30", icon: "map", title: "Santuário Fushimi Inari", location: "Quioto", note: "Os icónicos torii vermelhos em fila, um dos postais de Quioto." },
        { time: "16:30", icon: "map", title: "Cerimónia tradicional do chá", location: "Quioto", note: "Uma pausa contemplativa no ritmo da viagem." },
      ],
    },
    {
      id: 6,
      city: "Hiroshima",
      label: "Sex",
      date: "21 Ago",
      title: "Hiroshima e Miyajima",
      activities: [
        { time: "07:40", icon: "car", title: "Shinkansen Nozomi 277 Quioto → Hiroshima", location: "Estação Central de Quioto", note: "Lugar reservado, 2ª classe." },
        { time: "10:30", icon: "car", title: "Travessia de ferry até Miyajima", location: "Hiroshima", note: "O famoso torii flutuante de Itsukushima." },
        { time: "16:00", icon: "map", title: "Parque Memorial da Paz", location: "Hiroshima", note: "Momento de reflexão sobre a história da cidade." },
        { time: "19:00", icon: "car", title: "Regresso a Quioto", location: "Hiroshima", note: "Overnight em Quioto." },
      ],
    },
    {
      id: 7,
      city: "Takarazuka",
      label: "Sáb",
      date: "22 Ago",
      title: "Quioto, Osaka e Takarazuka",
      activities: [
        { time: "09:00", icon: "car", title: "Partida de Quioto com paragem em Osaka", location: "Quioto", note: "Breve visita à cidade de Osaka pelo caminho." },
        { time: "14:00", icon: "hotel", title: "Chegada a Takarazuka", location: "Takarazuka", note: "Check-in no hotel." },
        { time: "16:00", icon: "hotel", title: "Experiência de Onsen tradicional", location: "Takarazuka", note: "Banho termal japonês incluído no programa." },
      ],
    },
    {
      id: 8,
      city: "Osaka",
      label: "Dom",
      date: "23 Ago",
      title: "Himeji, Kobe e Chegada a Osaka",
      activities: [
        { time: "09:00", icon: "car", title: "Partida de Takarazuka", location: "Takarazuka", note: "Em direção a Osaka, com paragens pelo caminho." },
        { time: "11:00", icon: "map", title: "Castelo de Himeji", location: "Himeji", note: "O castelo feudal mais bem preservado do Japão." },
        { time: "14:30", icon: "map", title: "Passeio por Kobe", location: "Kobe", note: "Cidade portuária cosmopolita, conhecida pela gastronomia." },
        { time: "18:00", icon: "hotel", title: "Check-in no hotel em Osaka", location: "Osaka", note: "Início de duas noites na cidade." },
      ],
    },
    {
      id: 9,
      city: "Osaka",
      label: "Seg",
      date: "24 Ago",
      title: "Osaka e Partida",
      activities: [
        { time: "10:00", icon: "map", title: "Visita ao Castelo de Osaka", location: "Osaka", note: "Um dos símbolos mais marcantes da cidade, rodeado por jardins." },
        { time: "17:30", icon: "car", title: "Transfer para o Aeroporto de Osaka", location: "Hotel em Osaka", note: "Tempo de antecedência para o check-in do voo." },
        { time: "22:10", icon: "plane", title: "Embarque no voo TK0087 Osaka → Istambul → Porto", location: "Aeroporto de Osaka", note: "Noite a bordo." },
      ],
    },
    {
      id: 10,
      city: "Porto",
      label: "Ter",
      date: "25 Ago",
      title: "Chegada a Porto",
      activities: [
        { time: "09:40", icon: "plane", title: "Chegada a Porto", location: "Aeroporto do Porto", note: "Fim da viagem. Bem-vindo a casa!" },
      ],
    },
  ],
  documents: [
    { type: "Voo", title: "Turkish Airlines TK0198 / TK0087", code: "OPO ⇄ IST ⇄ NRT/OSA", detail: "15 Ago partida · 24-25 Ago regresso", icon: "plane" },
    { type: "Comboio", title: "Shinkansen Nozomi 225", code: "Tóquio → Quioto", detail: "19 Ago · 09h17, 2ª classe", icon: "car" },
    { type: "Comboio", title: "Shinkansen Nozomi 277", code: "Quioto → Hiroshima", detail: "21 Ago · 07h40, 2ª classe", icon: "car" },
    { type: "Alojamento", title: "Hotéis em Tóquio, Quioto, Takarazuka e Osaka", code: "10 noites", detail: "Pequeno-almoço incluído em todas as estadas", icon: "hotel" },
    { type: "Seguro", title: "Seguro de Viagem Premium", code: "Incluído no pacote", detail: "Assistência em viagem incluída", icon: "shield" },
    { type: "Refeições", title: "Pensão parcial", code: "7 almoços + 6 jantares", detail: "Pequeno-almoço incluído todos os dias", icon: "food" },
  ],
  // REGRA: corresponde ao número do file/processo criado na Optitravel
  // para esta reserva — "JAPAO2026" é um valor de exemplo; substitui pelo
  // número real do file antes de enviares a app aos clientes.
  reservaCode: "JAPAO2026",
  // Lista de passageiros do file, usada como segunda verificação no login
  // (ver nameMatchesPassengerList). Os nomes abaixo são fictícios/exemplo —
  // substitui pela lista real de passageiros desta reserva antes de
  // enviares a app aos clientes. Se deixares a lista vazia, o login só
  // verifica o código de reserva (sem verificar o nome).
  passengers: ["Alberto Sousa", "Maria da Costa", "João Pereira"],
  // REGRA: agentName/agentPhone/agentEmail devem ser sempre os dados do
  // colaborador que criou esta reserva no Optitravel (ver mapOptitravelResponse).
  support: {
    isGroupTrip: true,
    agentName: "Rosário Pinto",
    agentRole: "O seu agente de viagens — A Tropical",
    agentPhone: "+351 919 394 043",
    agentEmail: "rosariopinto@turitropical.com",
    tourLeaderName: "Rosário Pinto",
    tourLeaderRole: "Tour Leader em viagem",
    tourLeaderPhone: "+351 919 394 043",
  },
};

/* Sugestões genéricas de recurso — usadas só se a pesquisa em tempo
 * real falhar. Propositadamente sem nomes de locais inventados,
 * porque têm de servir para qualquer cidade da viagem. */
function getFallbackGuide(city) {
  return [
    { name: `Pontos de interesse cultural em ${city}`, category: "cultura", rating: null, window: null, note: "Não foi possível obter sugestões em tempo real — fale com a sua agência para recomendações locais." },
    { name: `Gastronomia local em ${city}`, category: "gastronomia", rating: null, window: null, note: "Pergunte à equipa A Tropical por restaurantes recomendados na zona." },
    { name: `Museus em ${city}`, category: "museus", rating: null, window: null, note: "Verifique horários e exposições temporárias no local." },
    { name: `Eventos a decorrer em ${city}`, category: "eventos", rating: null, window: null, note: "Confirme junto da nossa equipa se há festivais ou eventos durante a sua estadia." },
  ];
}

/* ------------------------------------------------------------------
 * MAPEAMENTO DA RESPOSTA DA OPTITRAVEL → FORMATO DA APP
 * Isto já não corre aqui — a app web já não fala diretamente com a
 * Optitravel (ver loginToBackend mais abaixo). A lógica de mapeamento,
 * normalizeOptitravelCategory() e classifyServiceText() vivem agora só no
 * backend (atropical-backend/lib/optitravel.js). Ajustar lá quando
 * tivermos o schema real dos endpoints, mantendo os dois sincronizados.
 * ------------------------------------------------------------------ */

// Abre o PDF do voucher e pede à IA para ler o conteúdo e identificar a que
// serviço se refere (Alojamento, Transfer, Rent-a-Car, Seguro, ou Outro),
// devolvendo também um título e um resumo curtos. O PDF é sempre a fonte
// principal; o texto de "Serviços e Cálculos" (serviceText), quando
// existir, serve só para completar informação que falte ou esteja pouco
// clara no PDF (ex. datas difíceis de ler num documento digitalizado) —
// nunca substitui o que o PDF já diz claramente.
async function classifyVoucherWithAI(fileUrl, serviceText) {
  const pdfRes = await fetch(fileUrl);
  if (!pdfRes.ok) throw new Error(`Erro ao obter o PDF: ${pdfRes.status}`);
  const blob = await pdfRes.blob();
  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

  const supplementHint = serviceText
    ? `\n\nComo apoio complementar, eis o texto do serviço associado a este documento no sistema da agência: "${serviceText}". Usa isto APENAS para completar informação que esteja em falta ou pouco clara no PDF (ex. datas, nome do local) — a informação do PDF é sempre a fonte principal e tem prioridade sobre este texto sempre que houver conflito.`
    : "";

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: [
            { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64 } },
            {
              type: "text",
              text: `Este é um documento de viagem anexado a uma reserva. Lê o conteúdo e identifica o que é. Se for um PROGRAMA COMPLETO da viagem (descrição dia a dia de vários dias, com atividades/visitas — não apenas um único serviço), classifica como "Programa". Se for o voucher de um único serviço, classifica-o normalmente.${supplementHint} Responde APENAS com um objeto JSON, sem texto antes ou depois, sem markdown: {"category": "Programa|Alojamento|Transfer|Rent-a-Car|Seguro|Outro", "title": "título curto e claro em português de Portugal, ex. 'Voucher Hotel XPTO' ou 'Programa da Viagem'", "detail": "uma frase curta com o essencial — datas, local ou referência — em português de Portugal"}`,
            },
          ],
        },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Erro da API: ${res.status}`);
  const data = await res.json();
  const text = (data.content ?? [])
    .map((b) => b.text || "")
    .join("")
    .replace(/```json|```/g, "")
    .trim();
  return JSON.parse(text);
}

// Quando um documento é classificado como "Programa" (ver
// classifyVoucherWithAI), este documento — não os vouchers de serviços
// individuais — é a MELHOR fonte para construir o itinerário dia a dia,
// tal como foi feito manualmente para a viagem do Japão a partir do PDF
// do programa. Esta função automatiza esse mesmo processo: lê o PDF
// completo e devolve os dias estruturados no formato da app.
// IMPORTANTE: só incluir refeições nos dias se o programa as identificar
// claramente nesse dia — nunca distribuir/inventar a partir de um total
// agregado (ver regra já estabelecida sobre refeições).
async function generateItineraryFromProgramPDF(fileUrl) {
  const pdfRes = await fetch(fileUrl);
  if (!pdfRes.ok) throw new Error(`Erro ao obter o PDF do programa: ${pdfRes.status}`);
  const blob = await pdfRes.blob();
  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: [
            { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64 } },
            {
              type: "text",
              text: `Este é o programa completo de uma viagem. Lê-o com atenção e estrutura-o dia a dia, em português de Portugal, com fidelidade total ao texto original — não inventes nem acrescentes atividades, locais, refeições ou notas que não estejam explicitamente no documento.

Regra crítica sobre refeições: só inclui uma refeição (almoço/jantar) num dia se o programa a identificar claramente NESSE dia específico. Se o documento só indicar um total agregado de refeições (ex. "7 almoços + 6 jantares") sem dizer em que dias, NÃO distribuas nem inventes refeições por dia — simplesmente não incluas nenhuma atividade de refeição.

Responde APENAS com um array JSON, sem texto antes ou depois, sem markdown, no formato: [{"id": 1, "city": "nome da cidade nesse dia", "label": "dia da semana abreviado, ex. 'Seg'", "date": "data curta, ex. '15 Ago'", "title": "título curto do dia", "activities": [{"time": "HH:MM ou vazio", "icon": "plane|car|hotel|food|map", "title": "", "location": "", "note": "frase curta"}]}]`,
            },
          ],
        },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Erro da API: ${res.status}`);
  const data = await res.json();
  const text = (data.content ?? [])
    .map((b) => b.text || "")
    .join("")
    .replace(/```json|```/g, "")
    .trim();
  const days = JSON.parse(text);
  if (!Array.isArray(days) || days.length === 0) throw new Error("Itinerário vazio");
  return days;
}

// SEGUNDO NÍVEL DE RECURSO — usado quando NÃO existe nenhum documento
// "Programa" completo na reserva. Em vez de ficar sem itinerário, a app
// olha para todos os documentos já classificados (voos, vouchers de
// hotel, transfers, etc.) e tenta reconstruir, a partir desses dados:
// 1. O destino (ou destinos, se for uma viagem multi-cidade) — sobretudo
//    a partir dos voos;
// 2. Um esboço cronológico do itinerário — a partir das datas de
//    check-in/check-out de hotel, voos, e outros vouchers com data.
// Esta reconstrução é deliberadamente mais pobre do que ler um Programa
// completo (não tem atividades turísticas, só a logística que os
// documentos revelam) — fiel apenas ao que os documentos efetivamente
// mostram, nunca inventando visitas ou atividades.
async function inferTripFromDocuments(documents) {
  const summary = documents
    .filter((d) => d.title || d.detail || d.serviceText)
    .map((d, i) => `Documento ${i + 1}: tipo=${d.type}; título=${d.title || "—"}; detalhe=${d.detail || "—"}; texto do serviço=${d.serviceText || "—"}`)
    .join("\n");

  if (!summary.trim()) throw new Error("Sem documentos suficientes para reconstruir o itinerário");

  const prompt = `Aqui está uma lista de documentos/vouchers de uma reserva de viagem, sem um programa narrativo completo disponível. Com base sobretudo nos voos (para determinar o destino ou destinos da viagem) e nas datas de estadias em hotéis, transfers e outros vouchers (para reconstruir a cronologia), tenta determinar:

1. O destino da viagem — uma cidade, ou várias separadas por " / " se for uma viagem multi-destino;
2. Um esboço do itinerário dia a dia, em ordem cronológica, com base APENAS no que estes documentos efetivamente revelam — não inventes atividades turísticas, visitas ou refeições que não estejam implícitas nestes documentos. Cada dia deve refletir só a logística que os documentos mostram (voo, check-in/check-out de hotel, transfer, etc.).

Documentos:
${summary}

Responde APENAS com um objeto JSON, sem texto antes ou depois, sem markdown: {"destination": "", "days": [{"id": 1, "city": "", "label": "dia da semana abreviado, ex. 'Seg'", "date": "data curta, ex. '15 Ago'", "title": "título curto do dia", "activities": [{"time": "HH:MM ou vazio", "icon": "plane|car|hotel|food|map", "title": "", "location": "", "note": "frase curta"}]}]}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 3000,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`Erro da API: ${res.status}`);
  const data = await res.json();
  const text = (data.content ?? [])
    .map((b) => b.text || "")
    .join("")
    .replace(/```json|```/g, "")
    .trim();
  const result = JSON.parse(text);
  if (!result.destination || !Array.isArray(result.days) || result.days.length === 0) {
    throw new Error("Reconstrução incompleta");
  }
  return result;
}

// O mapeamento da resposta da Optitravel agora vive só no backend
// (atropical-backend/lib/optitravel.js) — a app web já não fala
// diretamente com a Optitravel, nem vê o token de acesso. Mantém os dois
// sincronizados se um deles for alterado (ver regra de sincronização).

// ÚNICA forma de obter os dados da viagem: verifica o código de reserva E
// o nome do passageiro do lado do servidor, e só devolve os dados se
// ambos corresponderem. Substitui a antiga fetchTripFromOptitravel(), que
// chamava a Optitravel diretamente do browser — isso exigia um token
// secreto visível no código do cliente, e não verificava o nome.
async function loginToBackend(reservaCode, name) {
  const res = await fetch(`${CONFIG.BACKEND_URL}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reservaCode, name }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Dados inseridos incorretos.");
  }
  return res.json();
}

/* ------------------------------------------------------------------
 * FOTOS DE CAPA REAIS — por DIA, não por cidade: cada foto mostra a
 * atração concreta que se visita nesse dia do itinerário (não apenas
 * a cidade em geral). Fotos reais do Unsplash, escolhidas e
 * verificadas uma a uma (sem precisar de chave de API). O dia de
 * Takarazuka não tem foto própria atribuída — nesse caso o Header
 * usa a ilustração de silhueta como substituto, para nunca ficar
 * sem capa. Atribuição ao fotógrafo incluída, como pedem as regras
 * do Unsplash.
 * ------------------------------------------------------------------ */
const DAY_PHOTOS = {
  1: {
    // Chegada a Tóquio
    url: "https://images.unsplash.com/photo-1741097574041-d70d3fe6a3ab?fm=jpg&q=60&w=1600&auto=format&fit=crop",
    author: "Wenhao Ruan",
    authorLink: "https://unsplash.com/@wenhao_ruan?utm_source=a_tropical_app&utm_medium=referral",
  },
  2: {
    // Templo Senso-ji, Asakusa
    url: "https://images.unsplash.com/photo-1745025911620-67a2dca9f378?fm=jpg&q=60&w=1600&auto=format&fit=crop",
    author: "Gang Hao",
    authorLink: "https://unsplash.com/@haogang?utm_source=a_tropical_app&utm_medium=referral",
  },
  3: {
    // Monte Fuji / Kawaguchiko
    url: "https://images.unsplash.com/photo-1741851373528-4cafe13b22ac?fm=jpg&q=60&w=1600&auto=format&fit=crop",
    author: "Peter Thomas",
    authorLink: "https://unsplash.com/@lifeof_peter_?utm_source=a_tropical_app&utm_medium=referral",
  },
  4: {
    // Veados de Nara
    url: "https://images.unsplash.com/photo-1687539161875-2176c0c094a7?fm=jpg&q=60&w=1600&auto=format&fit=crop",
    author: "Ken Li",
    authorLink: "https://unsplash.com/@kenli0893?utm_source=a_tropical_app&utm_medium=referral",
  },
  5: {
    // Fushimi Inari, Quioto
    url: "https://images.unsplash.com/photo-1751535076133-716cb28df027?fm=jpg&q=60&w=1600&auto=format&fit=crop",
    author: "Joshua Earle",
    authorLink: "https://unsplash.com/@joshuaearle?utm_source=a_tropical_app&utm_medium=referral",
  },
  6: {
    // Torii de Miyajima, Hiroshima
    url: "https://images.unsplash.com/photo-1754195451615-d4ca5e4f726b?fm=jpg&q=60&w=1600&auto=format&fit=crop",
    author: "PJH",
    authorLink: "https://unsplash.com/@dokae?utm_source=a_tropical_app&utm_medium=referral",
  },
  8: {
    // Castelo de Himeji
    url: "https://images.unsplash.com/photo-1741044223516-11f35f39ace9?fm=jpg&q=60&w=1600&auto=format&fit=crop",
    author: "Charlie Charoenwattana",
    authorLink: "https://unsplash.com/@charlie1224?utm_source=a_tropical_app&utm_medium=referral",
  },
  9: {
    // Castelo de Osaka
    url: "https://images.unsplash.com/photo-1745104428423-8927bed9dd84?fm=jpg&q=60&w=1600&auto=format&fit=crop",
    author: "Jivan Garcha",
    authorLink: "https://unsplash.com/@jivangarcha?utm_source=a_tropical_app&utm_medium=referral",
  },
  10: {
    // Chegada a Porto / Ponte D. Luís I
    url: "https://images.unsplash.com/photo-1701716302723-56041619eac8?fm=jpg&q=60&w=1600&auto=format&fit=crop",
    author: "Rui Alves",
    authorLink: "https://unsplash.com/@asfotosde1enorme?utm_source=a_tropical_app&utm_medium=referral",
  },
};

/* ------------------------------------------------------------------
 * GUIA DINÂMICO POR CIDADE — usa a API da Anthropic com pesquisa na
 * web para sugerir cultura, gastronomia, museus e eventos a decorrer
 * NA CIDADE DO DIA ATIVO. Ao mudar de dia (e por isso de cidade), o
 * Guia procura automaticamente sugestões novas para essa cidade.
 * ------------------------------------------------------------------ */
async function fetchGuideFromAI(city, whenLabel) {
  const prompt = `És um especialista em viagens da agência A Tropical. Pesquisa na web e sugere até 6 ideias atualmente relevantes para um cliente em ${city}, no dia ${whenLabel}: atividades culturais, experiências gastronómicas, exposições de museus, e eventos que estejam mesmo a decorrer nessa data.

Na categoria gastronomia, dá prioridade a restaurantes com estrela(s) Michelin em ${city} (verifica no Guia Michelin oficial, guide.michelin.com, quais têm efetivamente estrela nessa cidade — nunca presumas). Se ${city} não tiver restaurantes com estrela Michelin, ou já tiveres esgotado essas opções, sugere outras experiências gastronómicas credíveis da zona.

Para cada sugestão, inclui uma fonte real e credível que tenhas efetivamente encontrado na pesquisa (nunca inventes uma ligação) — usa preferencialmente sites oficiais e públicos, sem necessidade de qualquer chave de acesso, por esta ordem de preferência (válida para qualquer cidade ou país, não só para este destino):
1. Para restaurantes com estrela Michelin: a página oficial desse restaurante no guide.michelin.com;
2. Site oficial de turismo da cidade, região ou país de destino (o organismo oficial de turismo correspondente);
3. Site oficial do próprio local, museu, restaurante ou evento;
4. Wikipédia, como último recurso.
Evita plataformas comerciais como TripAdvisor, Tabelog ou Google Maps. Se não encontrares nenhuma fonte fiável para um item em concreto, usa "source": null e "sourceName": null — não preenchas com um valor inventado.

Responde APENAS com um array JSON, sem texto antes ou depois, sem markdown. Cada item: {"name": "", "category": "cultura|gastronomia|museus|eventos", "note": "frase curta em português de Portugal, até 22 palavras (refere o número de estrelas Michelin se aplicável)", "rating": número de 1 a 5 ou null, "window": "datas/horário curto, ou null", "source": "URL real encontrada na pesquisa, ou null", "sourceName": "nome curto do site, ex. Guia Michelin, ou null"}.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
      tools: [{ type: "web_search_20250305", name: "web_search" }],
    }),
  });
  if (!res.ok) throw new Error(`Erro da API: ${res.status}`);
  const data = await res.json();
  const text = (data.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n");
  const clean = text.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(clean);
  if (!Array.isArray(parsed) || parsed.length === 0) throw new Error("Resposta vazia");
  return parsed;
}

/* ------------------------------------------------------------------
 * FONTE PAGA 1 — TripAdvisor Content API. Só é chamada se
 * CONFIG.TRIPADVISOR_API_KEY estiver preenchida. Faz uma pesquisa por
 * categoria (atrações, restaurantes, museus) e depois pede os
 * detalhes (classificação, ligação real) de cada resultado.
 * Documentação: https://tripadvisor-content-api.readme.io
 * ------------------------------------------------------------------ */
async function taSearchAndDetail(query, category, mappedCategory) {
  const searchRes = await fetch(
    `https://api.content.tripadvisor.com/api/v1/location/search?key=${CONFIG.TRIPADVISOR_API_KEY}&searchQuery=${encodeURIComponent(query)}&category=${category}&language=pt`,
    { headers: { Accept: "application/json" } }
  );
  if (!searchRes.ok) throw new Error(`TripAdvisor search: ${searchRes.status}`);
  const searchData = await searchRes.json();
  const top = (searchData.data ?? []).slice(0, 2);

  const detailed = await Promise.all(
    top.map(async (loc) => {
      try {
        const detRes = await fetch(
          `https://api.content.tripadvisor.com/api/v1/location/${loc.location_id}/details?key=${CONFIG.TRIPADVISOR_API_KEY}&language=pt`,
          { headers: { Accept: "application/json" } }
        );
        if (!detRes.ok) throw new Error();
        const det = await detRes.json();
        return {
          name: det.name ?? loc.name,
          category: mappedCategory,
          rating: det.rating ? Number(det.rating) : null,
          window: null,
          note: det.address_obj?.address_string ?? "",
          source: det.web_url ?? null,
          sourceName: det.web_url ? "TripAdvisor" : null,
        };
      } catch {
        return null;
      }
    })
  );
  return detailed.filter(Boolean);
}

async function fetchGuideFromTripAdvisor(city) {
  const [cultura, gastronomia, museus] = await Promise.all([
    taSearchAndDetail(`${city} atrações turísticas`, "attractions", "cultura"),
    taSearchAndDetail(`${city} restaurantes`, "restaurants", "gastronomia"),
    taSearchAndDetail(`${city} museus`, "attractions", "museus"),
  ]);
  const items = [...cultura, ...gastronomia, ...museus];
  if (items.length === 0) throw new Error("Sem resultados na TripAdvisor");
  return items;
}

/* ------------------------------------------------------------------
 * FONTE PAGA 2 — Google Places API (New). Só é chamada se
 * CONFIG.GOOGLE_PLACES_API_KEY estiver preenchida (e a TripAdvisor
 * não estiver configurada). Documentação:
 * https://developers.google.com/maps/documentation/places/web-service
 * ------------------------------------------------------------------ */
async function gpTextSearch(query, mappedCategory) {
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": CONFIG.GOOGLE_PLACES_API_KEY,
      "X-Goog-FieldMask": "places.displayName,places.rating,places.formattedAddress,places.googleMapsUri",
    },
    body: JSON.stringify({ textQuery: query, languageCode: "pt", maxResultCount: 2 }),
  });
  if (!res.ok) throw new Error(`Google Places: ${res.status}`);
  const data = await res.json();
  return (data.places ?? []).map((p) => ({
    name: p.displayName?.text ?? "",
    category: mappedCategory,
    rating: p.rating ?? null,
    window: null,
    note: p.formattedAddress ?? "",
    source: p.googleMapsUri ?? null,
    sourceName: p.googleMapsUri ? "Google Maps" : null,
  }));
}

async function fetchGuideFromGooglePlaces(city) {
  const [cultura, gastronomia, museus] = await Promise.all([
    gpTextSearch(`atrações turísticas em ${city}`, "cultura"),
    gpTextSearch(`restaurantes em ${city}`, "gastronomia"),
    gpTextSearch(`museus em ${city}`, "museus"),
  ]);
  const items = [...cultura, ...gastronomia, ...museus];
  if (items.length === 0) throw new Error("Sem resultados no Google Places");
  return items;
}

/* ------------------------------------------------------------------
 * ORQUESTRADOR — escolhe automaticamente a melhor fonte disponível:
 * 1. TripAdvisor, se houver chave configurada;
 * 2. Google Places, se houver chave configurada;
 * 3. Pesquisa por IA em sites públicos de turismo (sem custo), como
 *    reserva sempre disponível. Esta ordem aplica-se a qualquer
 *    cidade ou país — não é específica do Japão.
 * ------------------------------------------------------------------ */
async function fetchGuide(city, whenLabel) {
  if (CONFIG.TRIPADVISOR_API_KEY) {
    try {
      return { items: await fetchGuideFromTripAdvisor(city), status: "paid", sourceLabel: "TripAdvisor" };
    } catch {
      /* cai para a próxima fonte */
    }
  }
  if (CONFIG.GOOGLE_PLACES_API_KEY) {
    try {
      return { items: await fetchGuideFromGooglePlaces(city), status: "paid", sourceLabel: "Google Places" };
    } catch {
      /* cai para a próxima fonte */
    }
  }
  return { items: await fetchGuideFromAI(city, whenLabel), status: "ai" };
}

function ActivityIcon({ name, color = C.bronze, size = 16 }) {
  const props = { size, color, strokeWidth: 2 };
  if (name === "plane") return <Plane {...props} />;
  if (name === "car") return <Car {...props} />;
  if (name === "hotel") return <BedDouble {...props} />;
  if (name === "food") return <UtensilsCrossed {...props} />;
  if (name === "shield") return <ShieldCheck {...props} />;
  return <MapPin {...props} />;
}

function StatusBar() {
  return (
    <div className="flex items-center justify-between px-6 pt-3 pb-1 text-[11px] font-medium" style={{ color: C.paper, fontFamily: "IBM Plex Mono, monospace" }}>
      <span>9:41</span>
      <div className="flex items-center gap-1">
        <div className="flex gap-[2px] items-end h-[9px]">
          <span style={{ background: C.paper, width: 2, height: 4 }} />
          <span style={{ background: C.paper, width: 2, height: 6 }} />
          <span style={{ background: C.paper, width: 2, height: 8 }} />
          <span style={{ background: C.paper, width: 2, height: 9 }} />
        </div>
        <div style={{ width: 20, height: 10, border: `1px solid ${C.paper}`, borderRadius: 2, padding: 1 }}>
          <div style={{ background: C.paper, width: "75%", height: "100%", borderRadius: 1 }} />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------
 * SKYLINES DE CAPA — em vez de fotografias (que não consegui obter
 * de forma fiável através das minhas ferramentas), uma ilustração
 * de silhueta por cidade, no mesmo espírito de um cartaz de viagem
 * vintage. Servem de "imagem de capa" no Header, por trás do título.
 * ------------------------------------------------------------------ */
function TokyoSkyline() {
  return (
    <svg viewBox="0 0 400 100" preserveAspectRatio="none" className="w-full h-full" fill="currentColor">
      <polygon points="15,100 70,32 125,100" opacity="0.7" />
      <rect x="135" y="60" width="18" height="40" />
      <rect x="156" y="45" width="14" height="55" />
      <rect x="174" y="65" width="16" height="35" />
      <rect x="195" y="50" width="20" height="50" />
      <rect x="240" y="55" width="16" height="45" />
      <rect x="260" y="70" width="14" height="30" />
      <polygon points="300,100 296,42 300,12 304,42" />
      <rect x="291" y="38" width="18" height="6" />
      <rect x="293" y="24" width="14" height="5" />
    </svg>
  );
}

function KyotoSkyline() {
  return (
    <svg viewBox="0 0 400 100" preserveAspectRatio="none" className="w-full h-full" fill="currentColor">
      <polygon points="150,100 128,86 172,86" />
      <polygon points="150,86 133,74 167,74" />
      <polygon points="150,74 137,63 163,63" />
      <polygon points="150,63 140,53 160,53" />
      <polygon points="150,53 143,44 157,44" />
      <rect x="148" y="30" width="4" height="14" />
      <rect x="250" y="40" width="6" height="60" />
      <rect x="310" y="40" width="6" height="60" />
      <rect x="244" y="33" width="78" height="8" />
      <rect x="252" y="46" width="60" height="5" />
      <rect x="20" y="84" width="32" height="16" opacity="0.6" />
      <polygon points="15,84 36,70 57,84" opacity="0.6" />
    </svg>
  );
}

function HiroshimaSkyline() {
  return (
    <svg viewBox="0 0 400 100" preserveAspectRatio="none" className="w-full h-full" fill="currentColor">
      <rect x="0" y="78" width="400" height="2" opacity="0.4" />
      <rect x="150" y="40" width="6" height="40" />
      <rect x="210" y="40" width="6" height="40" />
      <rect x="144" y="33" width="78" height="7" />
      <rect x="153" y="46" width="60" height="5" />
      <path d="M 280 80 A 25 25 0 0 1 330 80" fill="none" stroke="currentColor" strokeWidth="3" />
      <line x1="290" y1="80" x2="290" y2="58" stroke="currentColor" strokeWidth="2" />
      <line x1="320" y1="80" x2="320" y2="58" stroke="currentColor" strokeWidth="2" />
      <rect x="268" y="80" width="70" height="4" opacity="0.6" />
    </svg>
  );
}

function TakarazukaSkyline() {
  return (
    <svg viewBox="0 0 400 100" preserveAspectRatio="none" className="w-full h-full" fill="currentColor">
      <path d="M 130 100 L 130 55 A 40 40 0 0 1 210 55 L 210 100" fill="none" stroke="currentColor" strokeWidth="4" />
      <rect x="122" y="96" width="96" height="5" opacity="0.7" />
      <ellipse cx="300" cy="92" rx="42" ry="9" opacity="0.6" />
      <path d="M 285 80 Q 280 64 290 54 Q 300 70 295 80" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.6" />
      <path d="M 307 80 Q 302 60 313 48 Q 322 66 314 80" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.6" />
    </svg>
  );
}

function OsakaSkyline() {
  return (
    <svg viewBox="0 0 400 100" preserveAspectRatio="none" className="w-full h-full" fill="currentColor">
      <rect x="40" y="80" width="20" height="20" opacity="0.6" />
      <rect x="64" y="70" width="16" height="30" opacity="0.6" />
      <rect x="160" y="80" width="80" height="20" />
      <rect x="170" y="62" width="60" height="18" />
      <polygon points="160,62 200,48 240,62" />
      <rect x="182" y="40" width="36" height="22" />
      <polygon points="178,40 200,27 222,40" />
      <rect x="195" y="18" width="10" height="10" />
      <rect x="302" y="74" width="18" height="26" opacity="0.6" />
      <rect x="324" y="64" width="16" height="36" opacity="0.6" />
    </svg>
  );
}

function PortoSkyline() {
  return (
    <svg viewBox="0 0 400 100" preserveAspectRatio="none" className="w-full h-full" fill="currentColor">
      <path d="M 55 100 Q 200 8 345 100" fill="none" stroke="currentColor" strokeWidth="4" />
      <line x1="200" y1="26" x2="200" y2="100" stroke="currentColor" strokeWidth="2" opacity="0.5" />
      <rect x="18" y="78" width="22" height="22" />
      <polygon points="16,78 29,65 42,78" />
      <rect x="46" y="82" width="18" height="18" opacity="0.7" />
      <polygon points="44,82 55,71 66,82" opacity="0.7" />
      <rect x="338" y="80" width="20" height="20" />
      <polygon points="336,80 348,67 360,80" />
      <rect x="362" y="76" width="18" height="24" opacity="0.7" />
    </svg>
  );
}

function GenericSkyline() {
  return (
    <svg viewBox="0 0 400 100" preserveAspectRatio="none" className="w-full h-full" fill="currentColor">
      <rect x="40" y="70" width="24" height="30" opacity="0.6" />
      <rect x="70" y="55" width="18" height="45" />
      <rect x="94" y="68" width="20" height="32" opacity="0.6" />
      <rect x="290" y="60" width="20" height="40" opacity="0.6" />
      <rect x="316" y="48" width="16" height="52" />
      <rect x="338" y="64" width="18" height="36" opacity="0.6" />
    </svg>
  );
}

const SKYLINES = {
  Tóquio: TokyoSkyline,
  Quioto: KyotoSkyline,
  Hiroshima: HiroshimaSkyline,
  Takarazuka: TakarazukaSkyline,
  Osaka: OsakaSkyline,
  Porto: PortoSkyline,
};

function CitySkyline({ city }) {
  const Skyline = SKYLINES[city] ?? GenericSkyline;
  return <Skyline />;
}

/* ------------------------------------------------------------------
 * CURIOSIDADES POR PAÍS — mostradas no ecrã de transição depois do
 * login, enquanto a app "abre". Pensado para qualquer destino futuro:
 * basta adicionar uma nova entrada com o nome do país usado em
 * trip.country. Sem entrada correspondente, usa-se "default".
 * ------------------------------------------------------------------ */
const COUNTRY_FACTS = {
  Japão: [
    { hook: "Entusiasmado(a) com o Japão?", fact: "Segundo o recenseamento mais recente (2023), o Japão tem 14.125 ilhas — mais do dobro do que se pensava até então. Quase 98% da população vive nas quatro maiores: Honshu, Hokkaido, Kyushu e Shikoku." },
    { hook: "Sabia que...", fact: "O Japão tem uma das maiores densidades de máquinas de venda automática do mundo — cerca de uma para cada 23 a 30 habitantes." },
    { hook: "Uma curiosidade antes de partir...", fact: "Durante décadas, o comboio-bala (Shinkansen) Tokaido teve atrasos médios inferiores a um minuto por viagem — um dos recordes de pontualidade ferroviária do mundo." },
    { hook: "Já sabia isto?", fact: "O Japão é o país com mais pessoas centenárias do mundo, e está entre os que têm maior esperança média de vida." },
    { hook: "Para já ir pensando...", fact: "Tirar os sapatos antes de entrar em casas, templos e alguns restaurantes é norma social, não apenas cortesia." },
    { hook: "Curiosidade gastronómica", fact: "Tóquio é a cidade do mundo com mais restaurantes premiados com estrelas Michelin — mais do que Paris ou qualquer outra cidade." },
  ],
  default: [
    { hook: "A preparar a sua viagem...", fact: "Estamos a juntar os últimos detalhes do seu itinerário personalizado." },
  ],
};

/* ------------------------------------------------------------------
 * INFORMAÇÃO PRÁTICA POR PAÍS — números de emergência, checklist de
 * preparação, fuso horário (IANA) e código da moeda. Tudo verificado
 * com pesquisa em fontes oficiais (Ministério dos Negócios Estrangeiros,
 * Embaixada de Portugal, sites oficiais de imigração) — nunca inventar
 * ou adivinhar estes dados; verificar sempre antes de adicionar um novo
 * destino, tal como já fazemos com COUNTRY_FACTS.
 * ------------------------------------------------------------------ */
const COUNTRY_INFO = {
  Japão: {
    timezone: "Asia/Tokyo",
    currencyCode: "JPY",
    currencySymbol: "¥",
    emergency: [
      { label: "Polícia", phone: "110" },
      { label: "Bombeiros / Ambulância", phone: "119" },
      { label: "Guarda Costeira", phone: "118" },
      { label: "Embaixada de Portugal em Tóquio — emergência 24h (também por WhatsApp)", phone: "+81 80 7172 7322" },
      { label: "Gabinete de Emergência Consular — Lisboa, 24h (apoio de reserva)", phone: "+351 217 929 714" },
    ],
    checklist: [
      { label: "Passaporte válido", detail: "Deve ser válido durante toda a estadia. O Japão não exige período adicional de validade além da duração da viagem." },
      { label: "Isenção de visto (turismo, até 90 dias)", detail: "Cidadãos portugueses não precisam de visto para turismo até 90 dias. O Japão aprovou a criação futura de uma autorização eletrónica de viagem para 74 países (incluindo Portugal), mas só entra em vigor a partir de 2028 — não afeta esta viagem." },
      { label: "Seguro de viagem", detail: "Já incluído no seu pacote A Tropical — ver aba Documentos." },
      { label: "Visit Japan Web (opcional)", detail: "Registo online gratuito que acelera a imigração e alfândega à chegada. Não é obrigatório, mas poupa tempo no aeroporto." },
      { label: "Dinheiro / câmbio", detail: "O Japão ainda usa muito dinheiro físico no dia a dia — vale a pena levar ou trocar alguns yenes à chegada." },
    ],
  },
  default: {
    timezone: null,
    currencyCode: null,
    currencySymbol: "",
    emergency: [],
    checklist: [],
  },
};

function DestinationTeaser({ country, onDone }) {
  const facts = COUNTRY_FACTS[country] ?? COUNTRY_FACTS.default;
  const [item] = useState(() => facts[Math.floor(Math.random() * facts.length)]);

  useEffect(() => {
    const t = setTimeout(onDone, 7500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="flex-1 flex flex-col items-center justify-center px-8 text-center"
      style={{ background: `linear-gradient(160deg, ${C.bronze}, ${C.bronzeDeep})` }}
    >
      <RefreshCw size={22} color={`${C.paper}CC`} className="animate-spin mb-6" />
      <p className="text-[13px] uppercase tracking-[0.1em] mb-3" style={{ color: `${C.paper}99`, fontFamily: "Inter, sans-serif" }}>
        {item.hook}
      </p>
      <p className="text-[13px] leading-relaxed" style={{ color: C.paper, fontFamily: "Fraunces, serif", fontWeight: 500 }}>
        {item.fact}
      </p>
    </div>
  );
}

// Normaliza o nome do cliente para apresentação correta, seja como for que
// tenha sido escrito (maiúsculas, minúsculas, ou uma mistura) — ex.
// "ALBERTO SOUSA" ou "alberto sousa" tornam-se ambos "Alberto Sousa".
// Preposições comuns em nomes portugueses mantêm-se em minúscula.
function formatClientName(raw) {
  const lowerWords = ["de", "da", "do", "das", "dos", "e"];
  return raw
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((word, i) => (i > 0 && lowerWords.includes(word) ? word : word.charAt(0).toUpperCase() + word.slice(1)))
    .join(" ");
}

// Remove acentos e normaliza para comparação (ex. "José" e "jose" tornam-se
// iguais), para não bloquear o acesso por o cliente não ter escrito os
// acentos exatamente.
function normalizeForMatch(s) {
  return (s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

// SEGUNDA VERIFICAÇÃO DE LOGIN: confirma que o nome introduzido corresponde
// a um dos passageiros listados no file da Optitravel para esta reserva —
// não basta acertar no código de reserva. Aceita-se se todas as palavras do
// nome introduzido aparecerem no nome de algum passageiro (tolerante a
// nomes do meio que o cliente não escreva, ou vice-versa). Se a lista de
// passageiros ainda não estiver disponível (ex. API por configurar), não
// bloqueia o acesso — fica apenas o código de reserva como verificação.
function nameMatchesPassengerList(enteredName, passengers) {
  if (!passengers || passengers.length === 0) return true;
  const enteredWords = normalizeForMatch(enteredName).split(/\s+/).filter(Boolean);
  if (enteredWords.length === 0) return false;
  return passengers.some((p) => {
    const passengerNorm = normalizeForMatch(p);
    return enteredWords.every((w) => passengerNorm.includes(w));
  });
}

function LoginScreen({ trip, prefillName, onSuccess }) {
  const [code, setCode] = useState("");
  const [name, setName] = useState(prefillName || "");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!code.trim()) {
      setError("Introduza o código de reserva.");
      return;
    }
    if (!name.trim()) {
      setError("Introduza o seu nome.");
      return;
    }
    if (name.trim().split(/\s+/).length < 2) {
      setError("Introduza o primeiro e o último nome.");
      return;
    }

    setError("");
    setSubmitting(true);

    // ÚNICA verificação que conta a sério: o backend confirma o código E o
    // nome contra os dados reais da Optitravel, do lado do servidor — não
    // é possível contornar isto a partir do browser. Só cai para a viagem
    // de exemplo (MOCK_TRIP) se o backend ainda não tiver credenciais
    // reais configuradas, para a app continuar testável nesse meio tempo.
    try {
      const realTrip = await loginToBackend(code, name);
      onSuccess(formatClientName(name), realTrip, false);
    } catch (backendErr) {
      const codeMatches = code.trim().toUpperCase() === (trip.reservaCode ?? "").toUpperCase();
      const nameMatches = nameMatchesPassengerList(name, trip.passengers);
      if (codeMatches && nameMatches) {
        onSuccess(formatClientName(name), trip, true);
      } else {
        setError("Dados inseridos incorretos.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div
      className="flex-1 flex flex-col items-center justify-center px-7"
      style={{ background: `linear-gradient(160deg, ${C.bronze}, ${C.bronzeDeep})` }}
    >
      <div className="rounded-xl px-4 py-2.5 mb-4" style={{ background: C.paper }}>
        <img
          src="https://www.atropical.pt/output/default/img/logo.png"
          alt="A Tropical"
          className="h-9 object-contain"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      </div>
      <p className="text-[11px] tracking-[0.08em] uppercase text-center" style={{ color: `${C.paper}CC`, fontFamily: "Inter, sans-serif" }}>
        A Tropical - Ag.Viagens e Turismo, Lda
      </p>
      <p className="text-[9px] mb-9" style={{ color: `${C.paper}99`, fontFamily: "Inter, sans-serif" }}>RNAVT 2016</p>

      <div className="w-full flex flex-col gap-3">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Código de reserva"
          className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none"
          style={{ background: C.paper, color: C.ink, fontFamily: "Inter, sans-serif", border: "none" }}
        />
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Primeiro e último nome"
          className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none"
          style={{ background: C.paper, color: C.ink, fontFamily: "Inter, sans-serif", border: "none" }}
        />
        {error && (
          <p className="text-xs" style={{ color: "#FFD9C2", fontFamily: "Inter, sans-serif" }}>
            {error}
          </p>
        )}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full rounded-xl py-3 text-sm mt-1 focus:outline-none"
          style={{ background: C.paper, color: C.bronzeDeep, fontFamily: "Inter, sans-serif", fontWeight: 600, opacity: submitting ? 0.6 : 1 }}
        >
          {submitting ? "A verificar..." : "Entrar"}
        </button>
      </div>

      <p className="text-[10px] mt-7 text-center" style={{ color: `${C.paper}80`, fontFamily: "Inter, sans-serif" }}>
        O código de reserva foi-lhe enviado pela sua agência.
      </p>
    </div>
  );
}

function Header({ trip, city, dayId, passengerName }) {
  const photo = DAY_PHOTOS[dayId];
  const [imgFailed, setImgFailed] = useState(false);
  useEffect(() => {
    setImgFailed(false);
  }, [dayId]);
  const showPhoto = photo && !imgFailed;
  return (
    <div className="relative overflow-hidden" style={{ background: `linear-gradient(160deg, ${C.bronze}, ${C.bronzeDeep})` }}>
      {showPhoto ? (
        <>
          <img
            src={photo.url}
            alt={city}
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setImgFailed(true)}
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(180deg, rgba(20,16,10,0) 0%, rgba(20,16,10,0) 38%, rgba(20,16,10,0.45) 70%, rgba(20,16,10,0.8) 100%)" }}
          />
          <a
            href={photo.authorLink}
            target="_blank"
            rel="noreferrer"
            className="absolute bottom-1 right-2 text-[9px]"
            style={{ color: `${C.paper}99`, fontFamily: "Inter, sans-serif" }}
          >
            Foto: {photo.author} / Unsplash
          </a>
        </>
      ) : (
        <div className="absolute bottom-0 left-0 w-full" style={{ height: 92, color: C.paper, opacity: 0.3 }}>
          <CitySkyline city={city} />
        </div>
      )}
      <div className="relative">
        <StatusBar />
        <div className="px-6 pt-3 pb-5">
          {passengerName && (
            <p className="text-[15px] mb-1.5" style={{ color: C.paper, fontFamily: "Fraunces, serif", fontWeight: 600, fontStyle: "italic" }}>
              Bem-vindo(a), {passengerName}
            </p>
          )}
          <p className="text-[11px] tracking-[0.08em] uppercase" style={{ color: `${C.paper}CC`, fontFamily: "Inter, sans-serif" }}>
            A Tropical - Ag.Viagens e Turismo, Lda
          </p>
          <p className="text-[9px] tracking-[0.04em]" style={{ color: `${C.paper}99`, fontFamily: "Inter, sans-serif" }}>
            RNAVT 2016
          </p>
          <h1 className="text-2xl mt-1 leading-tight" style={{ color: C.paper, fontFamily: "Fraunces, serif", fontWeight: 600 }}>
            {trip.destination}
          </h1>
          <div className="flex items-center justify-between mt-3">
            <p className="text-sm" style={{ color: C.mist, fontFamily: "Inter, sans-serif" }}>{trip.dates}</p>
            <p className="text-xs" style={{ color: C.mist, fontFamily: "IBM Plex Mono, monospace" }}>
              {trip.support?.isGroupTrip ? "Viagem em Grupo A Tropical" : trip.flight}
            </p>
          </div>
        </div>
      </div>
      <div
        className="relative"
        style={{
          height: 12,
          backgroundColor: C.bronzeDeep,
          backgroundImage: `radial-gradient(circle at 8px 6px, ${C.paper} 3.5px, transparent 4px)`,
          backgroundSize: "16px 12px",
        }}
      />
    </div>
  );
}

function DataSourceBanner({ usingFallback }) {
  if (!usingFallback) return null;
  return (
    <div className="flex items-center gap-2 px-4 py-2" style={{ background: "#F1E3C8", borderBottom: `1px solid ${C.mist}` }}>
      <p className="text-[11px] leading-snug" style={{ color: C.ink, fontFamily: "Inter, sans-serif" }}>
        A mostrar dados de exemplo — ligação à API do Optitravel por configurar.
      </p>
    </div>
  );
}

// Encontra o dia da viagem que corresponde à data de hoje. Se hoje for
// antes do início da viagem, abre o primeiro dia. Se for depois do fim,
// abre o último dia. Se for durante a viagem, abre o dia correspondente.
function findTodayDayId(days) {
  if (!days || days.length === 0) return 1;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const MONTHS = { jan: 0, fev: 1, mar: 2, abr: 3, mai: 4, jun: 5, jul: 6, ago: 7, set: 8, out: 9, nov: 10, dez: 11 };

  const parsed = days.map((d) => {
    // Tenta interpretar datas no formato "15 Ago", "24-25 Ago", etc.
    const match = (d.date || "").toLowerCase().match(/(\d+)(?:-\d+)?\s+([a-z]{3})/);
    if (!match) return { id: d.id, date: null };
    const day = parseInt(match[1]);
    const month = MONTHS[match[2]];
    if (month === undefined) return { id: d.id, date: null };
    // Tenta primeiro o ano atual, depois o seguinte (para viagens que cruzam anos)
    const yearNow = today.getFullYear();
    const d1 = new Date(yearNow, month, day);
    const d2 = new Date(yearNow + 1, month, day);
    // Usa o ano mais próximo da data de hoje
    const date = Math.abs(d1 - today) <= Math.abs(d2 - today) ? d1 : d2;
    return { id: d.id, date };
  });

  const withDates = parsed.filter((d) => d.date !== null);
  if (withDates.length === 0) return days[0].id;

  // Se hoje é antes do início, abre o primeiro dia
  if (today < withDates[0].date) return withDates[0].id;
  // Se hoje é depois do fim, abre o último dia
  if (today > withDates[withDates.length - 1].date) return withDates[withDates.length - 1].id;
  // Encontra o dia mais próximo de hoje (sem ultrapassar)
  let best = withDates[0];
  for (const d of withDates) {
    if (d.date <= today) best = d;
  }
  return best.id;
}

function DaySelector({ days, activeDay, setActiveDay }) {
  return (
    <div className="flex gap-2 px-4 py-3 overflow-x-auto" style={{ background: C.paper, borderBottom: `1px solid ${C.mist}` }}>
      {days.map((d) => {
        const active = d.id === activeDay;
        return (
          <button
            key={d.id}
            onClick={() => setActiveDay(d.id)}
            className="flex flex-col items-center justify-center px-4 py-2 rounded-xl shrink-0 focus:outline-none focus-visible:ring-2"
            style={{ background: active ? C.bronze : "transparent", border: `1px solid ${active ? C.bronze : C.mist}`, minWidth: 72 }}
          >
            <span className="text-[11px] uppercase tracking-wide" style={{ color: active ? C.paper : C.ink + "99", fontFamily: "Inter, sans-serif" }}>
              {d.label} · {d.date}
            </span>
            <span className="text-xs font-semibold" style={{ color: active ? C.paper : C.ink, fontFamily: "Inter, sans-serif" }}>
              {d.city}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function ActivityCard({ a }) {
  return (
    <div className="flex gap-3 px-4 py-3" style={{ borderBottom: `1px dashed ${C.mist}` }}>
      <div className="flex flex-col items-center pt-1" style={{ minWidth: 52 }}>
        <span className="text-xs font-semibold" style={{ color: C.bronze, fontFamily: "IBM Plex Mono, monospace" }}>{a.time}</span>
      </div>
      <div className="flex flex-col items-center pt-1">
        <div className="rounded-full p-2" style={{ background: C.mist }}>
          <ActivityIcon name={a.icon} />
        </div>
      </div>
      <div className="flex-1 pb-1">
        <p className="text-sm font-semibold leading-snug" style={{ color: C.ink, fontFamily: "Inter, sans-serif" }}>{a.title}</p>
        <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: C.bronze }}>
          <MapPin size={11} /> {a.location}
        </p>
        <p className="text-xs mt-1" style={{ color: C.ink + "B3", fontFamily: "Inter, sans-serif" }}>{a.note}</p>
      </div>
    </div>
  );
}

function DocumentCard({ d, classification }) {
  // Para documentos genéricos "Voucher", usa a classificação resolvida pela
  // IA (lida do próprio PDF) em vez da categoria genérica da Optitravel,
  // assim que estiver disponível.
  const resolved = d.needsClassification ? classification : null;
  const displayType = resolved?.status === "done" ? resolved.data.category : d.type;
  const displayTitle = resolved?.status === "done" ? resolved.data.title : d.title;
  const displayDetail = resolved?.status === "done" ? resolved.data.detail : d.detail;
  const isClassifying = d.needsClassification && (!resolved || resolved.status === "loading");

  return (
    <div className="flex rounded-xl overflow-hidden mb-3 shadow-sm" style={{ background: C.card, border: `1px solid ${C.mist}` }}>
      <div className="flex flex-col items-center justify-center gap-2 px-3 py-4" style={{ background: C.blue, minWidth: 56 }}>
        <ActivityIcon name={d.icon} color={C.paper} size={18} />
      </div>
      <div className="relative flex items-center px-0">
        <div style={{ borderLeft: `2px dashed ${C.mist}`, height: "100%" }} />
        <div className="absolute -top-2 -left-[5px] w-3 h-3 rounded-full" style={{ background: C.page }} />
        <div className="absolute -bottom-2 -left-[5px] w-3 h-3 rounded-full" style={{ background: C.page }} />
      </div>
      <div className="flex-1 px-4 py-3">
        <p className="text-[10px] uppercase tracking-wide" style={{ color: C.blue, fontFamily: "Inter, sans-serif" }}>
          {isClassifying ? "A identificar tipo de documento..." : displayType}
        </p>
        <p className="text-sm font-semibold" style={{ color: C.ink, fontFamily: "Inter, sans-serif" }}>{displayTitle}</p>
        <p className="text-xs mt-0.5" style={{ color: C.blue, fontFamily: "IBM Plex Mono, monospace" }}>{d.code}</p>
        <p className="text-xs mt-0.5" style={{ color: C.ink + "99" }}>{displayDetail}</p>
        {d.fileUrl && (
          <a
            href={d.fileUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[11px] mt-1.5"
            style={{ color: C.blue, fontFamily: "Inter, sans-serif", fontWeight: 600, textDecoration: "none" }}
          >
            <FileText size={11} /> Abrir documento (PDF)
          </a>
        )}
      </div>
    </div>
  );
}

function CategoryChips({ active, setActive }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-3">
      {GUIDE_FILTERS.map((c) => {
        const isActive = active === c.key;
        return (
          <button
            key={c.key}
            onClick={() => setActive(c.key)}
            className="px-3 py-1.5 rounded-full text-[11px] font-medium shrink-0 focus:outline-none"
            style={{ background: isActive ? C.orange : C.card, color: isActive ? C.paper : C.ink + "99", border: `1px solid ${isActive ? C.orange : C.mist}` }}
          >
            {c.label}
          </button>
        );
      })}
    </div>
  );
}

function GuideCard({ g }) {
  return (
    <div className="rounded-xl mb-3 px-4 py-3" style={{ background: C.card, border: `1px solid ${C.mist}` }}>
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold" style={{ color: C.ink, fontFamily: "Inter, sans-serif" }}>{g.name}</p>
          <p className="text-[11px] uppercase tracking-wide" style={{ color: C.orange }}>{CATEGORY_LABELS[g.category] ?? g.category}</p>
        </div>
        {g.rating != null && (
          <div className="flex items-center gap-1 shrink-0">
            <Star size={13} color={C.orange} fill={C.orange} />
            <span className="text-xs font-semibold" style={{ color: C.ink, fontFamily: "IBM Plex Mono, monospace" }}>{g.rating}</span>
          </div>
        )}
      </div>
      {g.window && (
        <p className="text-[11px] mt-1.5 flex items-center gap-1" style={{ color: C.ink + "99", fontFamily: "Inter, sans-serif" }}>
          <Clock size={11} /> {g.window}
        </p>
      )}
      <p className="text-xs mt-2" style={{ color: C.ink + "B3", fontFamily: "Inter, sans-serif" }}>{g.note}</p>
      {g.source && (
        <a
          href={g.source}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-[11px] mt-2"
          style={{ color: C.bronze, fontFamily: "Inter, sans-serif", fontWeight: 500, textDecoration: "none" }}
        >
          Ver em {g.sourceName || "fonte externa"} <ExternalLink size={11} />
        </a>
      )}
    </div>
  );
}

function waLink(phone, message) {
  if (!phone) return null;
  const digits = phone.replace(/[^\d]/g, ""); // wa.me só aceita números, sem "+" nem espaços
  return `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}

function ContactRow({ icon, label, value, href }) {
  if (!value) return null;
  const Icon = icon;
  return (
    <a
      href={href}
      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
      style={{ background: C.page, textDecoration: "none" }}
    >
      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: `${C.bronze}1A` }}>
        <Icon size={14} color={C.bronze} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px]" style={{ color: C.ink + "80", fontFamily: "Inter, sans-serif" }}>{label}</p>
        <p className="text-[13px] truncate" style={{ color: C.ink, fontFamily: "Inter, sans-serif", fontWeight: 500 }}>{value}</p>
      </div>
    </a>
  );
}

function SupportModal({ support, tripName, emergencyContacts, onClose }) {
  if (!support) return null;
  return (
    <div className="absolute inset-0 z-30 flex items-end justify-center" style={{ background: "rgba(20,16,10,0.55)" }} onClick={onClose}>
      <div
        className="w-full rounded-t-3xl p-5"
        style={{ background: C.paper, maxHeight: "82%", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg" style={{ color: C.ink, fontFamily: "Fraunces, serif", fontWeight: 600 }}>Precisa de ajuda?</h2>
          <button onClick={onClose} className="p-1.5 rounded-full focus:outline-none" style={{ background: C.card, border: `1px solid ${C.mist}` }} aria-label="Fechar">
            <X size={14} color={C.ink} />
          </button>
        </div>

        <p className="text-[11px] uppercase tracking-[0.12em] mb-2" style={{ color: C.bronze, fontFamily: "Inter, sans-serif" }}>
          {support.agentRole}
        </p>
        <div className="rounded-2xl p-1 mb-1" style={{ border: `1px solid ${C.mist}` }}>
          <p className="text-[15px] px-3 pt-2 pb-1" style={{ color: C.ink, fontFamily: "Fraunces, serif", fontWeight: 600 }}>
            {support.agentName || "Por confirmar"}
          </p>
          <div className="flex flex-col gap-1.5 p-2">
            <ContactRow
              icon={MessageCircle}
              label="WhatsApp"
              value={support.agentPhone ? "Conversar agora" : null}
              href={waLink(support.agentPhone, `Olá ${support.agentName}, sou cliente da viagem "${tripName}" e gostava de tirar uma dúvida.`)}
            />
            <ContactRow icon={Phone} label="Telefone de trabalho" value={support.agentPhone} href={support.agentPhone ? `tel:${support.agentPhone.replace(/\s/g, "")}` : undefined} />
            <ContactRow icon={Mail} label="E-mail" value={support.agentEmail} href={support.agentEmail ? `mailto:${support.agentEmail}` : undefined} />
          </div>
        </div>

        {support.isGroupTrip && (
          <>
            <p className="text-[11px] uppercase tracking-[0.12em] mt-4 mb-2" style={{ color: C.bronze, fontFamily: "Inter, sans-serif" }}>
              {support.tourLeaderRole}
            </p>
            <div className="rounded-2xl p-1" style={{ border: `1px solid ${C.mist}` }}>
              <p className="text-[15px] px-3 pt-2 pb-1" style={{ color: C.ink, fontFamily: "Fraunces, serif", fontWeight: 600 }}>
                {support.tourLeaderName || "Por confirmar"}
              </p>
              <div className="flex flex-col gap-1.5 p-2">
                <ContactRow
                  icon={MessageCircle}
                  label="WhatsApp"
                  value={support.tourLeaderPhone ? "Conversar agora" : null}
                  href={waLink(support.tourLeaderPhone, `Olá ${support.tourLeaderName}, sou cliente da viagem "${tripName}".`)}
                />
                <ContactRow icon={Phone} label="Contacto móvel direto (durante a viagem)" value={support.tourLeaderPhone} href={support.tourLeaderPhone ? `tel:${support.tourLeaderPhone.replace(/\s/g, "")}` : undefined} />
              </div>
            </div>
          </>
        )}

        {emergencyContacts && emergencyContacts.length > 0 && (
          <>
            <p className="text-[11px] uppercase tracking-[0.12em] mt-4 mb-2 flex items-center gap-1.5" style={{ color: "#B23A2E", fontFamily: "Inter, sans-serif" }}>
              <Siren size={13} /> Em caso de emergência
            </p>
            <div className="rounded-2xl p-1" style={{ border: "1px solid #E3B7AE", background: "#FBEFEC" }}>
              <div className="flex flex-col gap-1.5 p-2">
                {emergencyContacts.map((c, i) => (
                  <a
                    key={i}
                    href={`tel:${c.phone.replace(/\s/g, "")}`}
                    className="flex items-center justify-between px-3 py-2 rounded-xl"
                    style={{ background: C.card, textDecoration: "none" }}
                  >
                    <span className="text-[12px] pr-2" style={{ color: C.ink, fontFamily: "Inter, sans-serif" }}>{c.label}</span>
                    <span className="text-[13px] shrink-0" style={{ color: "#B23A2E", fontFamily: "IBM Plex Mono, monospace", fontWeight: 600 }}>{c.phone}</span>
                  </a>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ClockWidget({ timezone, city }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(t);
  }, []);

  if (!timezone) return null;
  const localTime = now.toLocaleTimeString("pt-PT", { timeZone: timezone, hour: "2-digit", minute: "2-digit" });
  const ptTime = now.toLocaleTimeString("pt-PT", { timeZone: "Europe/Lisbon", hour: "2-digit", minute: "2-digit" });
  const diffHours = Math.round(
    (new Date(now.toLocaleString("en-US", { timeZone: timezone })) - new Date(now.toLocaleString("en-US", { timeZone: "Europe/Lisbon" }))) / 36e5
  );

  return (
    <div className="rounded-2xl p-4 mb-4" style={{ background: C.card, border: `1px solid ${C.mist}` }}>
      <p className="text-[11px] uppercase tracking-[0.1em] mb-3 flex items-center gap-1.5" style={{ color: C.ink + "80", fontFamily: "Inter, sans-serif" }}>
        <Clock size={13} /> Fuso horário
      </p>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px]" style={{ color: C.ink + "80", fontFamily: "Inter, sans-serif" }}>{city || "Destino"}</p>
          <p className="text-2xl" style={{ color: C.ink, fontFamily: "Fraunces, serif", fontWeight: 600 }}>{localTime}</p>
        </div>
        <div className="text-right">
          <p className="text-[11px]" style={{ color: C.ink + "80", fontFamily: "Inter, sans-serif" }}>Portugal</p>
          <p className="text-2xl" style={{ color: C.ink + "99", fontFamily: "Fraunces, serif", fontWeight: 600 }}>{ptTime}</p>
        </div>
      </div>
      <p className="text-[11px] mt-2 text-center" style={{ color: C.ink + "70", fontFamily: "Inter, sans-serif" }}>
        {diffHours >= 0 ? `${diffHours}h adiantado em relação a Portugal` : `${Math.abs(diffHours)}h atrasado em relação a Portugal`}
      </p>
    </div>
  );
}

// Conversor de moeda — usa a taxa de referência do BCE (Banco Central
// Europeu), através da API pública e gratuita do Frankfurter, sem
// necessidade de chave de acesso.
function CurrencyConverter({ currencyCode, currencySymbol }) {
  const [amount, setAmount] = useState("100");
  const [rate, setRate] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | done | error

  useEffect(() => {
    if (!currencyCode) return;
    setStatus("loading");
    fetch(`https://api.frankfurter.app/latest?from=EUR&to=${currencyCode}`)
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao obter taxa de câmbio");
        return res.json();
      })
      .then((data) => {
        setRate(data.rates?.[currencyCode] ?? null);
        setStatus("done");
      })
      .catch(() => setStatus("error"));
  }, [currencyCode]);

  if (!currencyCode) return null;
  const numericAmount = parseFloat(amount.replace(",", ".")) || 0;
  const converted = rate ? (numericAmount * rate).toLocaleString("pt-PT", { maximumFractionDigits: 0 }) : "—";

  return (
    <div className="rounded-2xl p-4 mb-4" style={{ background: C.card, border: `1px solid ${C.mist}` }}>
      <p className="text-[11px] uppercase tracking-[0.1em] mb-3 flex items-center gap-1.5" style={{ color: C.ink + "80", fontFamily: "Inter, sans-serif" }}>
        <Banknote size={13} /> Conversor de moeda
      </p>
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <p className="text-[10px] mb-1" style={{ color: C.ink + "80", fontFamily: "Inter, sans-serif" }}>Euros (€)</p>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputMode="decimal"
            className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
            style={{ background: C.paper, color: C.ink, fontFamily: "IBM Plex Mono, monospace", border: `1px solid ${C.mist}` }}
          />
        </div>
        <span className="mt-5" style={{ color: C.ink + "80" }}>≈</span>
        <div className="flex-1">
          <p className="text-[10px] mb-1" style={{ color: C.ink + "80", fontFamily: "Inter, sans-serif" }}>{currencyCode} ({currencySymbol})</p>
          <div
            className="w-full rounded-lg px-3 py-2 text-sm"
            style={{ background: C.paper, color: C.ink, fontFamily: "IBM Plex Mono, monospace", border: `1px solid ${C.mist}` }}
          >
            {status === "loading" ? "..." : status === "error" ? "—" : converted}
          </div>
        </div>
      </div>
      {status === "error" && (
        <p className="text-[10px] mt-2" style={{ color: C.ink + "70", fontFamily: "Inter, sans-serif" }}>
          Não foi possível obter a taxa de câmbio em tempo real.
        </p>
      )}
      {status === "done" && rate && (
        <p className="text-[10px] mt-2" style={{ color: C.ink + "70", fontFamily: "Inter, sans-serif" }}>
          1 € ≈ {rate.toLocaleString("pt-PT", { maximumFractionDigits: 2 })} {currencyCode} · taxa BCE em tempo real
        </p>
      )}
    </div>
  );
}

function PrepChecklist({ items }) {
  const [checked, setChecked] = useState({});
  if (!items || items.length === 0) return null;
  return (
    <div className="rounded-2xl p-4 mb-4" style={{ background: C.card, border: `1px solid ${C.mist}` }}>
      <p className="text-[11px] uppercase tracking-[0.1em] mb-3 flex items-center gap-1.5" style={{ color: C.ink + "80", fontFamily: "Inter, sans-serif" }}>
        <CheckSquare size={13} /> Checklist antes de partir
      </p>
      <div className="flex flex-col gap-3">
        {items.map((item, i) => {
          const isChecked = !!checked[i];
          const Icon = isChecked ? CheckSquare : Square;
          return (
            <button
              key={i}
              onClick={() => setChecked((prev) => ({ ...prev, [i]: !prev[i] }))}
              className="flex items-start gap-2.5 text-left focus:outline-none"
            >
              <Icon size={16} color={isChecked ? "#3F7D5C" : C.ink + "66"} className="mt-0.5 shrink-0" />
              <div>
                <p
                  className="text-[13px]"
                  style={{ color: C.ink, fontFamily: "Inter, sans-serif", fontWeight: 600, textDecoration: isChecked ? "line-through" : "none", opacity: isChecked ? 0.6 : 1 }}
                >
                  {item.label}
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: C.ink + "90", opacity: isChecked ? 0.6 : 1 }}>{item.detail}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FeedbackCard({ support, tripName, reservaCode, passengerName }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [consent, setConsent] = useState(false);
  const [sent, setSent] = useState(false);

  const sendFeedback = async () => {
    try {
      await fetch(`${CONFIG.BACKEND_URL}/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripName, reservaCode, passengerName, rating, comment, consentMarketing: consent }),
      });
    } catch {
      /* falha silenciosa */
    }
    setSent(true);
  };

  if (sent) {
    return (
      <div className="rounded-2xl p-4 mb-4 text-center" style={{ background: C.card, border: `1px solid ${C.mist}` }}>
        <p className="text-sm" style={{ color: C.ink, fontFamily: "Inter, sans-serif" }}>Obrigado pela sua opinião! 🙏</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-4 mb-4" style={{ background: C.card, border: `1px solid ${C.mist}` }}>
      <p className="text-[11px] uppercase tracking-[0.1em] mb-3" style={{ color: C.ink + "80", fontFamily: "Inter, sans-serif" }}>Como foi a sua viagem?</p>
      <div className="flex justify-center gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} onClick={() => setRating(n)} className="focus:outline-none">
            <Star size={26} color={n <= rating ? C.bronze : C.mist} fill={n <= rating ? C.bronze : "none"} />
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Quer deixar mais algum comentário? (opcional)"
        rows={2}
        className="w-full rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none"
        style={{ background: C.paper, color: C.ink, fontFamily: "Inter, sans-serif", border: `1px solid ${C.mist}`, resize: "none" }}
      />
      <label className="flex items-start gap-2 mb-3 cursor-pointer">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 shrink-0"
          style={{ accentColor: C.bronze }}
        />
        <span className="text-[11px] leading-snug" style={{ color: C.ink + "99", fontFamily: "Inter, sans-serif" }}>
          Autorizo que a A Tropical guarde este feedback e possa utilizá-lo para efeitos de marketing e promoção.
        </span>
      </label>
      <button
        onClick={sendFeedback}
        disabled={rating === 0}
        className="w-full rounded-xl py-2.5 text-sm flex items-center justify-center gap-2 focus:outline-none"
        style={{ background: rating === 0 ? C.mist : C.bronze, color: C.paper, fontFamily: "Inter, sans-serif", fontWeight: 600 }}
      >
        <Send size={14} /> Enviar feedback
      </button>
    </div>
  );
}

function NextTripCard() {
  return (
    <a
      href="https://www.atropical.pt"
      target="_blank"
      rel="noreferrer"
      className="rounded-2xl p-4 mb-4 flex items-center justify-between"
      style={{ background: `linear-gradient(120deg, ${C.bronze}, ${C.bronzeDeep})`, textDecoration: "none" }}
    >
      <div>
        <p className="text-[11px] uppercase tracking-[0.1em] mb-1" style={{ color: `${C.paper}CC`, fontFamily: "Inter, sans-serif" }}>Já a pensar na próxima?</p>
        <p className="text-sm" style={{ color: C.paper, fontFamily: "Fraunces, serif", fontWeight: 600 }}>Descubra outros destinos A Tropical</p>
      </div>
      <ExternalLink size={18} color={C.paper} />
    </a>
  );
}

function BottomNav({ active, setActive }) {
  const items = [
    { key: "itinerary", label: "Itinerário", icon: CalendarDays, tint: C.bronze },
    { key: "documents", label: "Documentos", icon: FileText, tint: C.blue },
    { key: "guide", label: "Guia", icon: Compass, tint: C.orange },
    { key: "useful", label: "Útil", icon: Globe, tint: "#3F7D5C" },
  ];
  return (
    <div className="flex justify-around py-2" style={{ background: C.card, borderTop: `1px solid ${C.mist}` }}>
      {items.map(({ key, label, icon: Icon, tint }) => {
        const isActive = active === key;
        return (
          <button key={key} onClick={() => setActive(key)} className="flex flex-col items-center gap-0.5 px-3 py-1 focus:outline-none">
            <Icon size={18} color={isActive ? tint : C.ink + "66"} strokeWidth={isActive ? 2.4 : 1.8} />
            <span className="text-[10px]" style={{ color: isActive ? tint : C.ink + "66", fontFamily: "Inter, sans-serif" }}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

function PhoneSkeleton() {
  return (
    <div className="flex-1 flex items-center justify-center" style={{ background: C.paper }}>
      <RefreshCw size={22} color={C.bronze} className="animate-spin" />
    </div>
  );
}

export default function App() {
  const [trip, setTrip] = useState(MOCK_TRIP);
  const [usingFallback, setUsingFallback] = useState(true);
  const [activeTab, setActiveTab] = useState("itinerary");
  const [supportOpen, setSupportOpen] = useState(false);
  const [activeDay, setActiveDay] = useState(() => findTodayDayId(MOCK_TRIP.days));
  const [guideCache, setGuideCache] = useState({}); // { [city]: { status: 'loading'|'ai'|'fallback', items } }
  const [voucherCache, setVoucherCache] = useState({}); // { [fileUrl]: { status: 'loading'|'done'|'error', data } }

  useEffect(() => {
    const pending = (trip.documents ?? []).filter((d) => d.needsClassification && d.fileUrl && !voucherCache[d.fileUrl]);
    if (pending.length === 0) return;
    pending.forEach((d) => {
      setVoucherCache((prev) => ({ ...prev, [d.fileUrl]: { status: "loading", data: null } }));
      classifyVoucherWithAI(d.fileUrl, d.serviceText)
        .then((data) => setVoucherCache((prev) => ({ ...prev, [d.fileUrl]: { status: "done", data } })))
        .catch(() => setVoucherCache((prev) => ({ ...prev, [d.fileUrl]: { status: "error", data: null } })));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trip.documents]);

  const [itineraryFromProgram, setItineraryFromProgram] = useState(null); // "loading" | "done" | "error" | null

  // Se algum documento for identificado como "Programa" (o documento mais
  // completo e fiável para o itinerário), gera os dias automaticamente a
  // partir dele e substitui os dias que vieram da reserva. Se nenhum
  // documento for um "Programa", o itinerário fica como veio da reserva
  // (ou precisa de introdução manual — ver nota no mapOptitravelResponse).
  useEffect(() => {
    if (itineraryFromProgram) return; // já a processar ou já feito
    const programDoc = (trip.documents ?? []).find(
      (d) => d.fileUrl && voucherCache[d.fileUrl]?.status === "done" && voucherCache[d.fileUrl]?.data?.category === "Programa"
    );
    if (!programDoc) return;
    setItineraryFromProgram("loading");
    generateItineraryFromProgramPDF(programDoc.fileUrl)
      .then((days) => {
        setTrip((prev) => ({ ...prev, days }));
        setItineraryFromProgram("done");
      })
      .catch(() => setItineraryFromProgram("error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voucherCache, trip.documents]);

  const [itineraryFromDocs, setItineraryFromDocs] = useState(null); // "loading" | "done" | "error" | null

  // SEGUNDO NÍVEL DE RECURSO — só corre se: (1) não foi encontrado nenhum
  // "Programa" completo, (2) todos os documentos já terminaram de ser
  // classificados (ninguém ainda em "loading"), e (3) ainda não temos um
  // destino fiável (ex. ficou no valor genérico "Destino" do
  // mapOptitravelResponse). Nesse caso, tenta reconstruir o destino e um
  // esboço do itinerário a partir de todos os documentos da reserva.
  useEffect(() => {
    if (itineraryFromProgram === "loading" || itineraryFromProgram === "done") return; // já há Programa
    if (itineraryFromDocs) return; // já a processar ou já feito
    if (!trip.documents || trip.documents.length === 0) return;
    if (trip.destination && trip.destination !== "Destino") return; // já temos um destino fiável, não precisa de recurso

    const stillLoading = trip.documents.some((d) => d.fileUrl && d.needsClassification && voucherCache[d.fileUrl]?.status === "loading");
    if (stillLoading) return; // espera que todos os documentos terminem de ser classificados

    const hasProgram = trip.documents.some((d) => d.fileUrl && voucherCache[d.fileUrl]?.data?.category === "Programa");
    if (hasProgram) return; // há Programa — esse caminho já trata disto

    const enrichedDocs = trip.documents.map((d) => {
      const resolved = d.fileUrl ? voucherCache[d.fileUrl]?.data : null;
      return {
        type: resolved?.category ?? d.type,
        title: resolved?.title ?? d.title,
        detail: resolved?.detail ?? d.detail,
        serviceText: d.serviceText,
      };
    });

    setItineraryFromDocs("loading");
    inferTripFromDocuments(enrichedDocs)
      .then(({ destination, days }) => {
        setTrip((prev) => ({ ...prev, destination, days }));
        setItineraryFromDocs("done");
      })
      .catch(() => setItineraryFromDocs("error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voucherCache, trip.documents, trip.destination, itineraryFromProgram]);

  const [guideFilter, setGuideFilter] = useState("todos");
  const [stage, setStage] = useState("login"); // "login" | "teaser" | "app"

  // LOG OUT AUTOMÁTICO — depois de 30 minutos sem qualquer interação (toque,
  // clique, scroll, tecla) enquanto a app principal está aberta, volta ao
  // ecrã de login e exige inserir o código de reserva e o nome outra vez.
  // Não conta tempo enquanto está no ecrã de login ou na curiosidade do
  // destino — só depois de já estar dentro da app.
  const INACTIVITY_LIMIT_MS = 30 * 60 * 1000;
  const lastActivityRef = useRef(Date.now());

  useEffect(() => {
    if (stage !== "app") return;
    lastActivityRef.current = Date.now();

    const markActivity = () => {
      lastActivityRef.current = Date.now();
    };
    const events = ["pointerdown", "keydown", "scroll", "touchstart"];
    events.forEach((ev) => window.addEventListener(ev, markActivity, { passive: true }));

    const checkInterval = setInterval(() => {
      if (Date.now() - lastActivityRef.current >= INACTIVITY_LIMIT_MS) {
        setStage("login");
        setPassengerName("");
      }
    }, 15000); // verifica a cada 15s — suficiente para um limite de 30 min

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, markActivity));
      clearInterval(checkInterval);
    };
  }, [stage]);

  // Logout manual — o cliente pode querer saber, voltar ao ecrã de login
  // sem esperar pelos 30 minutos de inatividade (ex. antes de entregar o
  // telemóvel a outra pessoa).
  const handleManualLogout = () => {
    setStage("login");
    setPassengerName("");
  };

  // REGRA: o nome mostrado no Header é sempre o nome do cliente (primeiro e
  // último) exatamente como consta no bilhete de avião — nunca uma forma
  // abreviada/carinhosa diferente. Numa viagem de grupo com uma única
  // ligação partilhada, cada cliente recebe a sua própria versão do link
  // com "?nome=Primeiro+Último" (ex. via mail merge), para que o Header
  // mostre sempre o nome correto a quem está a ver a app. Sem esse
  // parâmetro, a app fica sem saudação pessoal em vez de arriscar mostrar
  // o nome errado a alguém.
  const [passengerName, setPassengerName] = useState(() => {
    if (typeof window === "undefined") return "";
    const params = new URLSearchParams(window.location.search);
    // Sem parâmetro "nome" na ligação, não mostrar nome nenhum — nunca um
    // valor genérico ou de exemplo, para não arriscar mostrar o nome
    // errado a um cliente real.
    const raw = params.get("nome") ?? params.get("name") ?? "";
    return raw ? formatClientName(raw) : "";
  });

  // CAMADA DE RESILIÊNCIA — guarda a última viagem obtida com sucesso no
  // login através do window.storage dos artefactos (não é um "modo
  // offline" completo, mas ajuda se a app fechar e reabrir pouco depois).
  const TRIP_CACHE_KEY = `trip-cache:${trip.reservaCode || "default"}`;

  const handleLoginSuccess = async (enteredName, tripData, isFallback) => {
    setPassengerName(enteredName);
    setTrip(tripData);
    setUsingFallback(isFallback);
    setActiveDay(findTodayDayId(tripData.days));
    if (!isFallback) {
      try {
        await window.storage?.set(TRIP_CACHE_KEY, JSON.stringify(tripData));
      } catch {
        /* falha a guardar cache não deve bloquear a app */
      }
    }
    setStage("teaser");
  };

  const day = trip.days.find((d) => d.id === activeDay) ?? trip.days[0];
  const currentCity = day.city;
  const countryInfo = COUNTRY_INFO[trip.country] ?? COUNTRY_INFO.default;
  const whenLabel = `${day.label}, ${day.date}`;

  const runGuideFetch = async (city, when) => {
    setGuideCache((prev) => ({ ...prev, [city]: { status: "loading", items: prev[city]?.items ?? null } }));
    try {
      const { items, status, sourceLabel } = await fetchGuide(city, when);
      setGuideCache((prev) => ({ ...prev, [city]: { status, items, sourceLabel } }));
    } catch (e) {
      setGuideCache((prev) => ({ ...prev, [city]: { status: "fallback", items: getFallbackGuide(city) } }));
    }
  };

  useEffect(() => {
    if (activeTab !== "guide") return;
    if (guideCache[currentCity]) return; // já temos dados (ou estão a carregar) para esta cidade
    runGuideFetch(currentCity, whenLabel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, currentCity]);

  const currentGuide = guideCache[currentCity];
  const guideItems = currentGuide?.items ?? null;
  const guideStatus = currentGuide?.status ?? "loading";
  const filteredGuide = (guideItems ?? []).filter((g) => guideFilter === "todos" || g.category === guideFilter);

  return (
    <div className="min-h-screen flex items-center justify-center py-10" style={{ background: C.page }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap');
      `}</style>

      <div
        className="rounded-3xl overflow-hidden flex flex-col relative"
        style={{ width: 380, height: 760, background: C.paper, boxShadow: "0 30px 60px -20px rgba(20,40,45,0.45)", border: `8px solid ${C.ink}` }}
      >
        {stage === "login" ? (
          <LoginScreen trip={trip} prefillName={passengerName} onSuccess={handleLoginSuccess} />
        ) : stage === "teaser" ? (
          <DestinationTeaser country={trip.country} onDone={() => setStage("app")} />
        ) : (
          <>
            <Header trip={trip} city={currentCity} dayId={activeDay} passengerName={passengerName} />
        {CONFIG.SHOW_FALLBACK_BANNER && <DataSourceBanner usingFallback={usingFallback} />}

        <>
            {activeTab === "itinerary" && (
              <>
                <DaySelector days={trip.days} activeDay={activeDay} setActiveDay={setActiveDay} />
                <div className="px-4 pt-3">
                  <h2 className="text-lg" style={{ color: C.ink, fontFamily: "Fraunces, serif", fontWeight: 600 }}>{day.title}</h2>
                  <p className="flex items-center gap-1 text-xs mt-0.5" style={{ color: C.bronze, fontFamily: "Inter, sans-serif" }}>
                    <MapPin size={12} /> {day.city}
                  </p>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {day.activities.map((a, i) => (
                    <ActivityCard key={i} a={a} />
                  ))}
                </div>
              </>
            )}

            {activeTab === "documents" && (
              <div className="flex-1 overflow-y-auto px-4 pt-4">
                <h2 className="text-lg mb-3" style={{ color: C.ink, fontFamily: "Fraunces, serif", fontWeight: 600 }}>Os seus documentos</h2>
                {trip.documents.map((d, i) => (
                  <DocumentCard key={i} d={d} classification={d.fileUrl ? voucherCache[d.fileUrl] : null} />
                ))}
              </div>
            )}

            {activeTab === "useful" && (
              <div className="flex-1 overflow-y-auto px-4 pt-4">
                <h2 className="text-lg mb-3" style={{ color: C.ink, fontFamily: "Fraunces, serif", fontWeight: 600 }}>Informação útil</h2>
                <ClockWidget timezone={countryInfo.timezone} city={currentCity} />
                <CurrencyConverter currencyCode={countryInfo.currencyCode} currencySymbol={countryInfo.currencySymbol} />
                <PrepChecklist items={countryInfo.checklist} />
                <FeedbackCard support={trip.support} tripName={trip.destination} reservaCode={trip.reservaCode} passengerName={passengerName} />
                <NextTripCard />
                <button
                  onClick={handleManualLogout}
                  className="w-full flex items-center justify-center gap-2 py-3 mt-2 mb-4 rounded-xl focus:outline-none"
                  style={{ background: C.card, border: "1px solid #B23A2E", color: "#B23A2E", fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600 }}
                >
                  <LogOut size={14} color="#B23A2E" /> Sair
                </button>
              </div>
            )}

            {activeTab === "guide" && (
              <div className="flex-1 overflow-y-auto px-4 pt-4">
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <h2 className="text-lg" style={{ color: C.ink, fontFamily: "Fraunces, serif", fontWeight: 600 }}>Guia de {currentCity}</h2>
                    <p className="text-[11px]" style={{ color: C.ink + "80", fontFamily: "Inter, sans-serif" }}>{day.label}, {day.date}</p>
                  </div>
                  <button onClick={() => runGuideFetch(currentCity, whenLabel)} className="p-1.5 rounded-full focus:outline-none" style={{ background: C.card, border: `1px solid ${C.mist}` }} aria-label="Atualizar sugestões">
                    <RefreshCw size={13} color={C.orange} className={guideStatus === "loading" ? "animate-spin" : ""} />
                  </button>
                </div>

                {guideStatus === "paid" && (
                  <p className="text-[11px] mb-2 mt-2" style={{ color: C.orange, fontFamily: "Inter, sans-serif" }}>
                    Dados em tempo real via {currentGuide?.sourceLabel}.
                  </p>
                )}
                {guideStatus === "ai" && (
                  <p className="text-[11px] mb-2 mt-2" style={{ color: C.orange, fontFamily: "Inter, sans-serif" }}>
                    Sugestões atualizadas com pesquisa em tempo real.
                  </p>
                )}
                {guideStatus === "fallback" && (
                  <p className="text-[11px] mb-2 mt-2" style={{ color: C.ink + "99", fontFamily: "Inter, sans-serif" }}>
                    Sugestões de exemplo — não foi possível obter dados em tempo real.
                  </p>
                )}

                <CategoryChips active={guideFilter} setActive={setGuideFilter} />

                {guideStatus === "loading" && !guideItems ? (
                  <div className="py-10 flex flex-col items-center gap-2">
                    <RefreshCw size={20} color={C.orange} className="animate-spin" />
                    <p className="text-xs text-center" style={{ color: C.ink + "99", fontFamily: "Inter, sans-serif" }}>
                      A procurar atividades, gastronomia, museus e eventos em {currentCity}...
                    </p>
                  </div>
                ) : (
                  filteredGuide.map((g, i) => <GuideCard key={i} g={g} />)
                )}
              </div>
            )}
          </>

        <button
          onClick={() => setSupportOpen(true)}
          className="absolute z-50 flex items-center justify-center rounded-full focus:outline-none"
          style={{ right: 14, bottom: 78, width: 46, height: 46, background: C.bronze, boxShadow: "0 8px 18px -4px rgba(110,79,34,0.55)" }}
          aria-label="Suporte"
        >
          <LifeBuoy size={20} color={C.paper} />
        </button>

        {supportOpen && (
          <SupportModal
            support={trip.support}
            tripName={trip.destination}
            emergencyContacts={(COUNTRY_INFO[trip.country] ?? COUNTRY_INFO.default).emergency}
            onClose={() => setSupportOpen(false)}
          />
        )}

        <BottomNav active={activeTab} setActive={setActiveTab} />
          </>
        )}
      </div>
    </div>
  );
}
