export interface WordItem {
  id: string;
  armenian: string;
  spanish: string;
  pronunciation: string; // Phonetic pronunciation in Armenian characters
  exampleArm: string;
  exampleEsp: string;
  category: string;
}

export interface Category {
  id: string;
  nameArm: string;
  nameEng: string;
  deity: string;
  descriptionArm: string;
  color: string;
  iconName: string; // Lucide icon reference
}

export interface Achievement {
  id: string;
  titleArm: string;
  descriptionArm: string;
  unlocked: boolean;
  iconType: string;
  condition: string;
}

export const CATEGORIES: Category[] = [
  {
    id: "greetings",
    nameArm: "Հերմեսի Բարևները",
    nameEng: "Hermes' Greetings",
    deity: "Հերմես (Hermes)",
    descriptionArm: "Ամենակարևոր բառերը և բարևները ճանապարհորդների համար:",
    color: "from-amber-500 to-yellow-600",
    iconName: "MessageSquare",
  },
  {
    id: "food",
    nameArm: "Դեմետրայի Խնջույքը",
    nameEng: "Demeter's Feast",
    deity: "Դեմետրա (Demeter)",
    descriptionArm: "Սնունդ, խմիչքներ և սեղանի շուրջ զրույցներ:",
    color: "from-emerald-500 to-teal-600",
    iconName: "Utensils",
  },
  {
    id: "travel",
    nameArm: "Ապոլոնի Ճամփորդությունը",
    nameEng: "Apollo's Journey",
    deity: "Ապոլոն (Apollo)",
    descriptionArm: "Կողմնորոշում քաղաքում, տրանսպորտ և տեսարժան վայրեր:",
    color: "from-blue-500 to-indigo-600",
    iconName: "Compass",
  },
  {
    id: "phrases",
    nameArm: "Աթենասի Իմաստությունը",
    nameEng: "Athena's Wisdom",
    deity: "Աթենաս (Athena)",
    descriptionArm: "Օգտակար արտահայտություններ, հարցեր և իմաստուն խորհուրդներ:",
    color: "from-purple-500 to-pink-600",
    iconName: "BookOpen",
  },
  {
    id: "love",
    nameArm: "Աֆրոդիտեի Կայծերը",
    nameEng: "Aphrodite's Sparks",
    deity: "Աֆրոդիտե (Aphrodite)",
    descriptionArm: "Սեր, ընտանիք, գեղեցիկ խոսքեր և զգացմունքներ:",
    color: "from-rose-500 to-red-600",
    iconName: "Heart",
  },
];

export const VOCABULARY: WordItem[] = [
  // Greetings (Hermes)
  {
    id: "greet1",
    armenian: "Բարև",
    spanish: "Hola",
    pronunciation: "Օլա",
    exampleArm: "Բարև, ինչպե՞ս ես:",
    exampleEsp: "Hola, ¿cómo estás?",
    category: "greetings"
  },
  {
    id: "greet2",
    armenian: "Շնորհակալություն",
    spanish: "Gracias",
    pronunciation: "Գրասիաս",
    exampleArm: "Շատ շնորհակալություն օգնության համար:",
    exampleEsp: "Muchas gracias por la ayuda.",
    category: "greetings"
  },
  {
    id: "greet3",
    armenian: "Խնդրեմ (ի պատասխան շնորհակալության)",
    spanish: "De nada",
    pronunciation: "Դե նադա",
    exampleArm: "— Շնորհակալություն: — Խնդրեմ:",
    exampleEsp: "— Gracias. — De nada.",
    category: "greetings"
  },
  {
    id: "greet4",
    armenian: "Ինչպե՞ս ես",
    spanish: "¿Cómo estás?",
    pronunciation: "Կոմո էստաս",
    exampleArm: "Բարև ընկեր, ինչպե՞ս ես:",
    exampleEsp: "Hola amigo, ¿cómo estás?",
    category: "greetings"
  },
  {
    id: "greet5",
    armenian: "Այո",
    spanish: "Sí",
    pronunciation: "Սի",
    exampleArm: "Այո, ես ցանկանում եմ սուրճ:",
    exampleEsp: "Sí, yo quiero un café.",
    category: "greetings"
  },
  {
    id: "greet6",
    armenian: "Ոչ",
    spanish: "No",
    pronunciation: "Նո",
    exampleArm: "Ոչ, ես չեմ խոսում իսպաներեն:",
    exampleEsp: "No, yo no hablo español.",
    category: "greetings"
  },
  {
    id: "greet7",
    armenian: "Բարի լույս",
    spanish: "Buenos días",
    pronunciation: "Բուենոս դիաս",
    exampleArm: "Բարի լույս, ընտանիք:",
    exampleEsp: "Buenos días, familia.",
    category: "greetings"
  },
  {
    id: "greet8",
    armenian: "Բարի երեկո / Բարի գիշեր",
    spanish: "Buenas noches",
    pronunciation: "Բուենաս նոչես",
    exampleArm: "Բարի երեկո բոլորին:",
    exampleEsp: "Buenas noches a todos.",
    category: "greetings"
  },
  {
    id: "greet9",
    armenian: "Հաջողություն",
    spanish: "Adiós",
    pronunciation: "Ադիոս",
    exampleArm: "Հաջողություն, մինչ վաղը:",
    exampleEsp: "Adiós, hasta mañana.",
    category: "greetings"
  },
  {
    id: "greet10",
    armenian: "Հաճելի է (ծանոթանալիս)",
    spanish: "Mucho gusto",
    pronunciation: "Մուչո գուստո",
    exampleArm: "Ես Աննան եմ: — Հաճելի է:",
    exampleEsp: "Soy Anna. — Mucho gusto.",
    category: "greetings"
  },

  // Food (Demeter)
  {
    id: "food1",
    armenian: "Ջուր",
    spanish: "Agua",
    pronunciation: "Ագուա",
    exampleArm: "Մեկ բաժակ ջուր, խնդրում եմ:",
    exampleEsp: "Un vaso de agua, por favor.",
    category: "food"
  },
  {
    id: "food2",
    armenian: "Հաց",
    spanish: "Pan",
    pronunciation: "Պան",
    exampleArm: "Ես սիրում եմ թարմ հաց:",
    exampleEsp: "Me gusta el pan fresco.",
    category: "food"
  },
  {
    id: "food3",
    armenian: "Գինի",
    spanish: "Vino",
    pronunciation: "Վինո",
    exampleArm: "Մեկ շիշ կարմիր գինի:",
    exampleEsp: "Una botella de vino tinto.",
    category: "food"
  },
  {
    id: "food4",
    armenian: "Խնձոր",
    spanish: "Manzana",
    pronunciation: "Մանսանա",
    exampleArm: "Ես ուտում եմ կարմիր խնձոր:",
    exampleEsp: "Yo como una manzana roja.",
    category: "food"
  },
  {
    id: "food5",
    armenian: "Պանիր",
    spanish: "Queso",
    pronunciation: "Կեսո",
    exampleArm: "Այս պանիրը շատ համեղ է:",
    exampleEsp: "Este queso es muy delicioso.",
    category: "food"
  },
  {
    id: "food6",
    armenian: "Ճաշ / Ուտելիք",
    spanish: "Comida",
    pronunciation: "Կոմիդա",
    exampleArm: "Ուտելիքը պատրաստ է:",
    exampleEsp: "La comida está lista.",
    category: "food"
  },
  {
    id: "food7",
    armenian: "Համեղ",
    spanish: "Delicioso",
    pronunciation: "Դելիսիոսո",
    exampleArm: "Այս պիցցան համեղ է:",
    exampleEsp: "Esta pizza es deliciosa.",
    category: "food"
  },
  {
    id: "food8",
    armenian: "Նախաճաշ",
    spanish: "Desayuno",
    pronunciation: "Դեսայունո",
    exampleArm: "Ի՞նչ ունենք նախաճաշին:",
    exampleEsp: "¿Qué tenemos para el desayuno?",
    category: "food"
  },
  {
    id: "food9",
    armenian: "Ընթրիք",
    spanish: "Cena",
    pronunciation: "Սենա",
    exampleArm: "Մենք գնում ենք ընթրիքի ժամը ութին:",
    exampleEsp: "Vamos a la cena a las ocho.",
    category: "food"
  },
  {
    id: "food10",
    armenian: "Աղցան",
    spanish: "Ensalada",
    pronunciation: "Էնսալադա",
    exampleArm: "Ես ուզում եմ թարմ աղցան:",
    exampleEsp: "Quiero una ensalada fresca.",
    category: "food"
  },

  // Travel (Apollo)
  {
    id: "trav1",
    armenian: "Տուն",
    spanish: "Casa",
    pronunciation: "Կասա",
    exampleArm: "Սա իմ տունն է:",
    exampleEsp: "Esta es mi casa.",
    category: "travel"
  },
  {
    id: "trav2",
    armenian: "Ճանապարհ",
    spanish: "Camino",
    pronunciation: "Կամինո",
    exampleArm: "Սա երկար ճանապարհ է:",
    exampleEsp: "Este es un camino largo.",
    category: "travel"
  },
  {
    id: "trav3",
    armenian: "Քաղաք",
    spanish: "Ciudad",
    pronunciation: "Սիուդադ",
    exampleArm: "Մադրիդը գեղեցիկ քաղաք է:",
    exampleEsp: "Madrid es una ciudad hermosa.",
    category: "travel"
  },
  {
    id: "trav4",
    armenian: "Օդանավակայան",
    spanish: "Aeropuerto",
    pronunciation: "Աերոպուերտո",
    exampleArm: "Ո՞րտեղ է օդանավակայանը:",
    exampleEsp: "¿Dónde está el aeropuerto?",
    category: "travel"
  },
  {
    id: "trav5",
    armenian: "Հյուրանոց",
    spanish: "Hotel",
    pronunciation: "Օտել",
    exampleArm: "Ես ապրում եմ այս հյուրանոցում:",
    exampleEsp: "Yo vivo en este hotel.",
    category: "travel"
  },
  {
    id: "trav6",
    armenian: "Տոմս",
    spanish: "Boleto",
    pronunciation: "Բոլետո",
    exampleArm: "Ինձ պետք է գնացքի տոմս:",
    exampleEsp: "Necesito un boleto de tren.",
    category: "travel"
  },
  {
    id: "trav7",
    armenian: "Քարտեզ",
    spanish: "Mapa",
    pronunciation: "Մապա",
    exampleArm: "Դուք ունե՞ք քաղաքի քարտեզը:",
    exampleEsp: "¿Tiene el mapa de la ciudad?",
    category: "travel"
  },
  {
    id: "trav8",
    armenian: "Ո՞րտեղ է...",
    spanish: "¿Dónde está...?",
    pronunciation: "Դոնդե էստա",
    exampleArm: "Ո՞րտեղ է հարևան խանութը:",
    exampleEsp: "¿Dónde está la tienda cercana?",
    category: "travel"
  },
  {
    id: "trav9",
    armenian: "Գնացք",
    spanish: "Tren",
    pronunciation: "Տրեն",
    exampleArm: "Գնացքը շուտով կժամանի:",
    exampleEsp: "El tren llegará pronto.",
    category: "travel"
  },
  {
    id: "trav10",
    armenian: "Ծով",
    spanish: "Mar",
    pronunciation: "Մար",
    exampleArm: "Մենք լողում ենք կապույտ ծովում:",
    exampleEsp: "Nosotros nadamos en el mar azul.",
    category: "travel"
  },

  // Wisdom (Athena)
  {
    id: "wis1",
    armenian: "Ես հասկանում եմ",
    spanish: "Yo entiendo",
    pronunciation: "Յո էնտիենդո",
    exampleArm: "Այո, ես հասկանում եմ ձեզ:",
    exampleEsp: "Sí, yo lo entiendo.",
    category: "phrases"
  },
  {
    id: "wis2",
    armenian: "Ես չգիտեմ",
    spanish: "No sé",
    pronunciation: "Նո սե",
    exampleArm: "Ես չգիտեմ, թե ուր է նա գնացել:",
    exampleEsp: "No sé a dónde fue.",
    category: "phrases"
  },
  {
    id: "wis3",
    armenian: "Օգնեցե՛ք",
    spanish: "Ayuda",
    pronunciation: "Այուդա",
    exampleArm: "Օգնեցե՛ք, ես կորել եմ:",
    exampleEsp: "Ayuda, estoy perdido.",
    category: "phrases"
  },
  {
    id: "wis4",
    armenian: "Ի՞նչ արժե",
    spanish: "¿Cuánto cuesta?",
    pronunciation: "Կուանտո կուեստա",
    exampleArm: "Ի՞նչ արժե այս հուշանվերը:",
    exampleEsp: "¿Cuánto cuesta este recuerdo?",
    category: "phrases"
  },
  {
    id: "wis5",
    armenian: "Ժամը քանիսն է",
    spanish: "¿Qué hora es?",
    pronunciation: "Կե օրա էս",
    exampleArm: "Ներեցեք, ժամը քանիսն է:",
    exampleEsp: "Disculpe, ¿qué hora es?",
    category: "phrases"
  },
  {
    id: "wis6",
    armenian: "Կարո՞ղ եք ինձ օգնել",
    spanish: "¿Puede ayudarme?",
    pronunciation: "Պուեդե այուդարմե",
    exampleArm: "Կարո՞ղ եք ինձ օգնել գտնել հասցեն:",
    exampleEsp: "¿Puede ayudarme a encontrar la dirección?",
    category: "phrases"
  },
  {
    id: "wis7",
    armenian: "Իհարկե",
    spanish: "Claro",
    pronunciation: "Կլարո",
    exampleArm: "— Կօգնե՞ք: — Իհարկե:",
    exampleEsp: "— ¿Me ayudas? — Claro.",
    category: "phrases"
  },
  {
    id: "wis8",
    armenian: "Խնդիր չկա",
    spanish: "No hay problema",
    pronunciation: "Նո այ պրոբլեմա",
    exampleArm: "Մի անհանգստացեք, խնդիր չկա:",
    exampleEsp: "No se preocupe, no hay problema.",
    category: "phrases"
  },
  {
    id: "wis9",
    armenian: "Կեցցե՛ս / Շատ լավ",
    spanish: "¡Muy bien!",
    pronunciation: "Մուի բիեն",
    exampleArm: "Աշխատանքը պատրաստ է: — Կեցցե՛ս:",
    exampleEsp: "El trabajo está listo. — ¡Muy bien!",
    category: "phrases"
  },
  {
    id: "wis10",
    armenian: "Հասկանալի է / Պարզ է",
    spanish: "Entendido",
    pronunciation: "Էնտենդիդո",
    exampleArm: "Ամեն ինչ պարզ է, շնորհակալություն:",
    exampleEsp: "Todo está entendido, gracias.",
    category: "phrases"
  },

  // Love (Aphrodite)
  {
    id: "love1",
    armenian: "Սեր",
    spanish: "Amor",
    pronunciation: "Ամոր",
    exampleArm: "Սերը փրկում է աշխարհը:",
    exampleEsp: "El amor salva al mundo.",
    category: "love"
  },
  {
    id: "love2",
    armenian: "Ընկեր / Ընկերուհի",
    spanish: "Amigo / Amiga",
    pronunciation: "Ամիգո / Ամիգա",
    exampleArm: "Նա իմ լավագույն ընկերն է:",
    exampleEsp: "Él es mi mejor amigo.",
    category: "love"
  },
  {
    id: "love3",
    armenian: "Ընտանիք",
    spanish: "Familia",
    pronunciation: "Ֆամիլիա",
    exampleArm: "Ես սիրում եմ իմ ընտանիքը:",
    exampleEsp: "Yo amo a mi familia.",
    category: "love"
  },
  {
    id: "love4",
    armenian: "Գեղեցիկ / Սիրուն",
    spanish: "Hermoso / Hermosa",
    pronunciation: "Էրմոսո / Էրմոսա",
    exampleArm: "Ինչպիսի՜ գեղեցիկ օր:",
    exampleEsp: "¡Qué hermoso día!",
    category: "love"
  },
  {
    id: "love5",
    armenian: "Ես քեզ սիրում եմ",
    spanish: "Te quiero / Te amo",
    pronunciation: "Տե կիեռո / Տե ամո",
    exampleArm: "Ես քեզ սիրում եմ ամբողջ սրտով:",
    exampleEsp: "Te amo con todo mi corazón.",
    category: "love"
  },
  {
    id: "love6",
    armenian: "Իմ կյանքը (սիրելիին դիմելիս)",
    spanish: "Mi vida",
    pronunciation: "Մի վիդա",
    exampleArm: "Դու իմ կյանքն ես:",
    exampleEsp: "Tú eres mi vida.",
    category: "love"
  },
  {
    id: "love7",
    armenian: "Ժպիտ",
    spanish: "Sonrisa",
    pronunciation: "Սոնրիսա",
    exampleArm: "Դու ունես գեղեցիկ ժպիտ:",
    exampleEsp: "Tienes una hermosa sonrisa.",
    category: "love"
  },
  {
    id: "love8",
    armenian: "Համբույր",
    spanish: "Beso",
    pronunciation: "Բեսո",
    exampleArm: "Ուղարկում եմ քեզ մի մեծ համբույր:",
    exampleEsp: "Te mando un beso grande.",
    category: "love"
  },
  {
    id: "love9",
    armenian: "Երջանկություն",
    spanish: "Felicidad",
    pronunciation: "Ֆելիսիդադ",
    exampleArm: "Ընտանիքը մեծ երջանկություն է:",
    exampleEsp: "La familia es una gran felicidad.",
    category: "love"
  },
  {
    id: "love10",
    armenian: "Իմ սիրելի / Սիրելիս",
    spanish: "Mi querido / Mi querida",
    pronunciation: "Մի կերիդո / Մի կերիդա",
    exampleArm: "Արի այստեղ, իմ սիրելի:",
    exampleEsp: "Ven aquí, mi querido.",
    category: "love"
  }
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: "badge_first_steps",
    titleArm: "Հերմեսի Թևավոր Սանդալներ",
    descriptionArm: "Ճիշտ պատասխանեք 5 հարցի հիմնական փորձության մեջ:",
    unlocked: false,
    iconType: "sandals",
    condition: "5_correct"
  },
  {
    id: "badge_streak",
    titleArm: "Ապոլոնի Ոսկե Քնար",
    descriptionArm: "Հասեք 8 անընդմեջ ճիշտ պատասխանների սերիայի (streak):",
    unlocked: false,
    iconType: "lyre",
    condition: "8_streak"
  },
  {
    id: "badge_perfect",
    titleArm: "Աթենասի Իմաստուն Բու",
    descriptionArm: "Ավարտեք որևէ թեմա 100% ճշգրտությամբ:",
    unlocked: false,
    iconType: "owl",
    condition: "100_percent"
  },
  {
    id: "badge_speed",
    titleArm: "Զևսի Ամպրոպ",
    descriptionArm: "«Օլիմպոսի Կանչ» արագ խաղում վաստակեք 12 կամ ավելի միավոր:",
    unlocked: false,
    iconType: "thunderbolt",
    condition: "12_speed"
  },
  {
    id: "badge_match",
    titleArm: "Տաճարի Ճարտարապետ",
    descriptionArm: "Հաջողությամբ ավարտեք «Տաճարի Խճանկար» (զույգերի միացման) խաղը:",
    unlocked: false,
    iconType: "temple",
    condition: "mosaic_complete"
  },
  {
    id: "badge_all",
    titleArm: "Աֆրոդիտեի Ոսկե Խնձոր",
    descriptionArm: "Բացեք բոլոր 5 կատեգորիաները և պատասխանեք 30+ հարցերի:",
    unlocked: false,
    iconType: "apple",
    condition: "30_total"
  }
];
