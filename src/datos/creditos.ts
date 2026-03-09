export type ResultadoPerfil = {
  titulo: string;
  dominio: string;
  url: string;
  descripcion: string;
  miniatura?: string;
};

export type PerfilCredito = {
  id: string;
  nombre: string;
  origen: string;
  paises: number[];
  bio: string;
  resultados: ResultadoPerfil[];
};

export type LogoInstitucion = {
  archivo: string;
  nombre: string;
};

export type ContenidoCuratorial = {
  tituloCabeceraA: string;
  tituloCabeceraB: string;
  tituloSeccion: string;
  parrafos: string[];
};

const perfilJuanCamilo = new URL('../../perfiles/juan-camilo.png', import.meta.url).href;
const perfilHugo = new URL('../../perfiles/hugo.png', import.meta.url).href;
const perfilAlexander = new URL('../../perfiles/alexander.png', import.meta.url).href;
const perfilAnna = new URL('../../perfiles/anna.png', import.meta.url).href;

const contenidoCuratorialPorIdioma: Record<string, ContenidoCuratorial> = {
  es: {
    tituloCabeceraA: 'Verdad de referencia',
    tituloCabeceraB: 'AIAIAIAIAIAIAIAIAI',
    tituloSeccion: 'Verdad de referencia',
    parrafos: [
      '“Verdad de referencia” (ground truth) no nombra una verdad del mundo: nombra el límite de lo que un modelo puede reconocer como real.',
      'En visión por computador, ese límite se define como un inventario cerrado de categorías. Lo que no entra en esa lista no puede ser detectado, y por tanto no puede existir para el sistema.',
      'Esta obra aplica COCO-SSD —uno de los modelos de detección de objetos más difundidos— sobre imágenes filmadas durante la colonia europea en África. El resultado no “describe” el archivo: lo reduce a una taxonomía prefabricada.',
      'Esa operación técnica resuena con la mirada colonial: clasificar para administrar, nombrar para dominar, volver equivalente lo que en la experiencia histórica y cultural no lo es.',
    ],
  },
  en: {
    tituloCabeceraA: 'Ground Truth',
    tituloCabeceraB: 'AIAIAIAIAIAIAIAIAI',
    tituloSeccion: 'Ground Truth',
    parrafos: [
      '“Ground truth” does not name a truth of the world; it names the limit of what a model can recognize as real.',
      'In computer vision, that limit is defined as a closed inventory of categories. What is not on that list cannot be detected, and therefore cannot exist for the system.',
      'This work applies COCO-SSD to images filmed during the European colonial period in Africa. The result does not describe the archive; it reduces it to a prebuilt taxonomy.',
      'That technical operation resonates with the colonial gaze: classifying to administer, naming to dominate, making equivalent what historical and cultural experience does not.',
    ],
  },
  fr: {
    tituloCabeceraA: 'Vérité de référence',
    tituloCabeceraB: 'AIAIAIAIAIAIAIAIAI',
    tituloSeccion: 'Vérité de référence',
    parrafos: [
      'La « vérité de référence » (ground truth) ne nomme pas une vérité du monde : elle nomme la limite de ce qu’un modèle peut reconnaître comme réel.',
      'En vision par ordinateur, cette limite est définie comme un inventaire fermé de catégories. Ce qui n’entre pas dans cette liste ne peut pas être détecté et ne peut donc pas exister pour le système.',
      'Cette œuvre applique COCO-SSD à des images filmées pendant la période coloniale européenne en Afrique. Le résultat ne décrit pas l’archive : il la réduit à une taxonomie préfabriquée.',
      'Cette opération technique résonne avec le regard colonial : classer pour administrer, nommer pour dominer, rendre équivalent ce qui ne l’est pas dans l’expérience historique et culturelle.',
    ],
  },
  pt: {
    tituloCabeceraA: 'Verdade de referência',
    tituloCabeceraB: 'AIAIAIAIAIAIAIAIAI',
    tituloSeccion: 'Verdade de referência',
    parrafos: [
      '“Verdade de referência” (ground truth) não nomeia uma verdade do mundo: nomeia o limite do que um modelo pode reconhecer como real.',
      'Na visão computacional, esse limite é definido como um inventário fechado de categorias. O que não entra nessa lista não pode ser detectado e, portanto, não pode existir para o sistema.',
      'Esta obra aplica COCO-SSD a imagens filmadas durante o período colonial europeu na África. O resultado não descreve o arquivo: ele o reduz a uma taxonomia pré-fabricada.',
      'Essa operação técnica ressoa com o olhar colonial: classificar para administrar, nomear para dominar, tornar equivalente o que não é equivalente na experiência histórica e cultural.',
    ],
  },
  ln: {
    tituloCabeceraA: 'Bosolo ya solo',
    tituloCabeceraB: 'AIAIAIAIAIAIAIAIAI',
    tituloSeccion: 'Bosolo ya solo',
    parrafos: [
      '“Bosolo ya solo” (ground truth) ezali solo ya mokili te: ezali ndelo ya oyo modèle ekoki koyeba lokola ya solo.',
      'Na vision par ordinateur, ndelo wana ezali liste ya ba catégories oyo ekangami. Oyo ezali te na liste wana ekoki komonana te, mpe ekoki kozala te mpo na système.',
      'Mosala oyo esaleli COCO-SSD na bilili oyo bafilmaki na tango ya colonie européenne na Afrika. Mbuma na yango ezali ndimbola ya archive te: ezali kokitisa yango na taxonomie oyo esalemi liboso.',
      'Mosala wana ezali koyokana na miso ya kolonial: kokabola mpo na koyangela, kopesa nkombo mpo na ko dominer, kosala lokola nyonso ezali ndenge moko tango ezali bongo te.',
    ],
  },
  sw: {
    tituloCabeceraA: 'Ukweli rejea',
    tituloCabeceraB: 'AIAIAIAIAIAIAIAIAI',
    tituloSeccion: 'Ukweli rejea',
    parrafos: [
      '“Ukweli rejea” (ground truth) hauiti ukweli wa dunia; huonyesha mpaka wa kile modeli inaweza kutambua kama halisi.',
      'Katika computer vision, mpaka huo huwekwa kama orodha iliyofungwa ya makundi. Kisicho ndani ya orodha hiyo hakiwezi kugunduliwa, hivyo hakiwezi kuwepo kwa mfumo.',
      'Kazi hii inatumia COCO-SSD kwenye picha zilizorekodiwa wakati wa ukoloni wa Ulaya barani Afrika. Matokeo hayaelezi kumbukumbu; yanaiweka ndani ya taksonomia iliyotayarishwa kabla.',
      'Operesheni hii ya kiufundi inaakisi mtazamo wa kikoloni: kuainisha ili kutawala, kutaja ili kuhodhi, na kufanya visivyo sawa vionekane sawa.',
    ],
  },
  rw: {
    tituloCabeceraA: 'Ukuri ngenderwaho',
    tituloCabeceraB: 'AIAIAIAIAIAIAIAIAI',
    tituloSeccion: 'Ukuri ngenderwaho',
    parrafos: [
      '“Ukuri ngenderwaho” (ground truth) ntibuvuga ukuri kw’isi; bugaragaza imipaka y’ibyo modèle ishobora kumenya nk’ukuri.',
      'Muri computer vision, uwo mupaka uba urutonde rufunze rw’amatsinda. Ikitari kuri urwo rutonde ntikimenyekana, bityo ntikibaho kuri sisitemu.',
      'Iki gikorwa gikoresha COCO-SSD ku mashusho yafashwe mu gihe cy’ubukoloni bw’u Burayi muri Afurika. Igisubizo ntigisobanura archive; kiyigabanya mo taxonomy yateguwe mbere.',
      'Iyi nzira y’ikoranabuhanga ihura n’irebera rya gikoloni: gushyira mu byiciro ngo bayobore, guha amazina ngo bategeke, no kunganya ibitangana.',
    ],
  },
  kg: {
    tituloCabeceraA: 'Kieleka ya ntendula',
    tituloCabeceraB: 'AIAIAIAIAIAIAIAIAI',
    tituloSeccion: 'Kieleka ya ntendula',
    parrafos: [
      '“Kieleka ya ntendula” (ground truth) ke zona kieleka ya nsi ko, kansi ndilu ya yina modèle lenda zaba bonso ya solo.',
      'Na vision par ordinateur, ndilu yina kele liste ya ba catégories yina kangama. Yina kele ve na liste yina lenda monana ve, mpe lenda zinga ve na système.',
      'Kisalu yayi ke sadila COCO-SSD na bilili yina bakangaka na ntangu ya colonie européenne na Afrika. Mbuma na yo ke tendula archive ve; ke kitisa yo na taxonomie yina salamaka ntete.',
      'Opération yai ke wakana ti meso ya colonie: kabula samu na kuyala, pesa nkumbu samu na kudomina, sala bonso nyonso kele ndenge mosi.',
    ],
  },
  yo: {
    tituloCabeceraA: 'Otito ìtọ́kasí',
    tituloCabeceraB: 'AIAIAIAIAIAIAIAIAI',
    tituloSeccion: 'Otito ìtọ́kasí',
    parrafos: [
      '“Otito ìtọ́kasí” (ground truth) kì í pe òtítọ́ ayé; ó ń tọ́ka sí ààlà ohun tí àwòrán-ẹ̀rọ lè mọ̀ gẹ́gẹ́ bí gidi.',
      'Nínú computer vision, ààlà yẹn jẹ́ àkójọ tí a ti pa mọ́ ti àwọn ẹ̀ka. Ohun tí kò sí nínú àkójọ náà kò lè jẹ́ àfihàn, nítorí náà kò sí fún eto náà.',
      'Iṣẹ́ yìí lo COCO-SSD lórí àwòrán tí a ya ní àkókò amúnisìn Yúróòpù ní Áfíríkà. Abajade rẹ̀ kò ṣàlàyé archive; ó dín un kù sí taxonomia tí a ti pèsè tán.',
      'Ìṣe imọ̀-ẹ̀rọ yìí bá ìwò amúnisìn mu: pín láti ṣàkóso, sọ orúkọ láti jẹ ológo, kí ohun tí kò dọ́gba dà bí ohun tó dọ́gba.',
    ],
  },
  ha: {
    tituloCabeceraA: 'Gaskiyar ma\'auni',
    tituloCabeceraB: 'AIAIAIAIAIAIAIAIAI',
    tituloSeccion: 'Gaskiyar ma\'auni',
    parrafos: [
      '“Gaskiyar ma\'auni” (ground truth) ba ta nufin gaskiyar duniya ba; tana nufin iyakar abin da samfurin ML zai iya gane wa a matsayin gaskiya.',
      'A computer vision, wannan iyaka tana zama rufaffen jerin rukuni. Abin da bai shiga jerin ba ba za a gano shi ba, don haka ba ya wanzuwa ga tsarin.',
      'Wannan aiki yana amfani da COCO-SSD a kan hotunan da aka dauka a lokacin mulkin mallakar Turai a Afirka. Sakamakon ba ya bayyana archive; yana rage shi zuwa taxonomia da aka riga aka tanada.',
      'Wannan aiki na fasaha yana amsa kallon mulkin mallaka: rarrabewa domin sarrafawa, sanya suna domin mulki, da daidaita abubuwan da ba su daidaita ba.',
    ],
  },
  am: {
    tituloCabeceraA: 'የመለኪያ እውነት',
    tituloCabeceraB: 'AIAIAIAIAIAIAIAIAI',
    tituloSeccion: 'የመለኪያ እውነት',
    parrafos: [
      '“የመለኪያ እውነት” (ground truth) የዓለም እውነትን አይሰይምም፤ ሞዴሉ እንደ እውነተኛ ሊያውቀው የሚችለውን ወሰን ይጠቁማል።',
      'በኮምፒውተር ቪዥን ውስጥ ይህ ወሰን የተዘጋ የምድቦች ዝርዝር ነው። በዝርዝሩ ውስጥ ያልገባ ነገር ሊታወቅ አይችልም፣ ስለዚህ ለሲስተሙ አይኖርም።',
      'ይህ ሥራ COCO-SSDን በአፍሪካ ላይ በአውሮፓ ቅኝ ግዛት ዘመን የተቀረፁ ምስሎች ላይ ይጠቀማል። ውጤቱ መዝገቡን አያብራራም፤ ወደ ቀድሞ የተዘጋጀ ምድብ ይቀንሰዋል።',
      'ይህ ቴክኒካዊ ሂደት ከቅኝ ግዛት እይታ ጋር ይጣጣማል፤ ለመቆጣጠር መመደብ፣ ለመግዛት መሰየም፣ እኩል ያልሆኑትን እኩል ማድረግ።',
    ],
  },
  zu: {
    tituloCabeceraA: 'Iqiniso lereferensi',
    tituloCabeceraB: 'AIAIAIAIAIAIAIAIAI',
    tituloSeccion: 'Iqiniso lereferensi',
    parrafos: [
      '“Iqiniso lereferensi” (ground truth) alibizi iqiniso lomhlaba; libiza umkhawulo walokho imodeli engakubona njengokwangempela.',
      'Ku-computer vision, lowo mkhawulo uba uhlu oluvaliwe lwezigaba. Okungekho kulolo hlu akukwazi ukubonwa, ngakho-ke akukho ohlelweni.',
      'Lo msebenzi usebenzisa i-COCO-SSD ezithombeni ezathathwa ngesikhathi sobukoloni baseYurophu e-Afrika. Umphumela awuchazi i-archive; uyinciphisa ibe yi-taxonomy eyakhiwe kusengaphambili.',
      'Le ndlela yobuchwepheshe iyahambisana nombono wobukoloni: ukuhlela ukuze kulawulwe, ukuqamba ukuze kubuswe, nokwenza okungalingani kubonakale kulingana.',
    ],
  },
  ar: {
    tituloCabeceraA: 'الحقيقة المرجعية',
    tituloCabeceraB: 'AIAIAIAIAIAIAIAIAI',
    tituloSeccion: 'الحقيقة المرجعية',
    parrafos: [
      '«الحقيقة المرجعية» لا تسمي حقيقة العالم؛ بل تسمي حدّ ما يستطيع النموذج التعرّف عليه بوصفه واقعاً.',
      'في الرؤية الحاسوبية، يُعرَّف هذا الحد كقائمة مغلقة من الفئات. ما لا يدخل هذه القائمة لا يمكن اكتشافه، وبالتالي لا وجود له بالنسبة للنظام.',
      'يطبّق هذا العمل COCO-SSD على صور صُوِّرت خلال الحقبة الاستعمارية الأوروبية في إفريقيا. النتيجة لا تصف الأرشيف؛ بل تختزله إلى تصنيف مُسبق.',
      'هذا الإجراء التقني ينسجم مع النظرة الاستعمارية: التصنيف من أجل الإدارة، والتسمية من أجل الهيمنة، وجعل غير المتكافئ متكافئاً.',
    ],
  },
  hi: {
    tituloCabeceraA: 'संदर्भ सत्य',
    tituloCabeceraB: 'AIAIAIAIAIAIAIAIAI',
    tituloSeccion: 'संदर्भ सत्य',
    parrafos: [
      '“संदर्भ सत्य” (ground truth) दुनिया की सत्यता का नाम नहीं है; यह उस सीमा का नाम है जिसे मॉडल वास्तविक के रूप में पहचान सकता है।',
      'कंप्यूटर विज़न में यह सीमा श्रेणियों की एक बंद सूची के रूप में तय होती है। जो उस सूची में नहीं है, वह पहचाना नहीं जा सकता, इसलिए सिस्टम के लिए उसका अस्तित्व नहीं है।',
      'यह कृति COCO-SSD को अफ्रीका में यूरोपीय उपनिवेश काल के दौरान फिल्माई गई छवियों पर लागू करती है। परिणाम अभिलेख का वर्णन नहीं करता; उसे पहले से बनी टैक्सोनॉमी में समेट देता है।',
      'यह तकनीकी क्रिया औपनिवेशिक दृष्टि से मेल खाती है: शासन के लिए वर्गीकरण, प्रभुत्व के लिए नामकरण, और असमान को समान बना देना।',
    ],
  },
  qu: {
    tituloCabeceraA: 'Chiqaq kay ñawpaq',
    tituloCabeceraB: 'AIAIAIAIAIAIAIAIAI',
    tituloSeccion: 'Chiqaq kay ñawpaq',
    parrafos: [
      '“Ground truth” nisqa mana kay pachaq chiqaq kayninta sutichanchu; modelo imatataq “chiqaq” nispa riqsiyta atinqa, chaypa linderonta sutichan.',
      'Computer vision ukhupi, chay linderonqa wichq’asqa lista de categorías nisqawanmi ruwasqa. Lista ukhuman mana yaykusqa imapas mana riqsisqachu, chayrayku sistemaqpaq mana kanchu.',
      'Kay obraqa COCO-SSD-ta churamun África suyupi Europa colonial pacha filmakunaq hawanpi. Lluqsisqanqa archive-ta mana willakunchu; prefabricada taxonomía-manmi qichun.',
      'Kay técnica ruwanakuyqa colonial qhawanawan tinkun: kamachinapaq clasificar, munayninta hap’inapaq sutichay, mana kaq equivalencia-ta equivalencia hina rikhuchiy.',
    ],
  },
  gn: {
    tituloCabeceraA: 'Añetegua joja',
    tituloCabeceraB: 'AIAIAIAIAIAIAIAIAI',
    tituloSeccion: 'Añetegua joja',
    parrafos: [
      '“Ground truth” ndaha’éi añetegua yvy rehegua réra; ha’e pe límite modelo ikatúva ohechakuaa mba’e añeteháicha.',
      'Computer vision-pe, upéva oñemoĩ peteĩ lista oñembotývape umi categoría rehe. Mba’e ndoikéiva upe listápe ndaikatúi ojejuhu, upévare sistema-pe ndoikói.',
      'Ko tembiapo ojeporu COCO-SSD rehe ta’ãnga kuéra oñefilmava’ekue colonia europea jave África-pe. Pe resultado ndosẽri archivo rehegua ñemombe’u; omboguejy taxonomía ojejapómava peve.',
      'Ko operación técnica ojokupyty pe mirada colonial rehe: oñemboja’o hag̃ua oñangareko ha oñeñangareko hag̃ua, oñembohéra hag̃ua ojejopy hag̃ua, ha oñembojoja hag̃ua mba’e ndojojáiva.',
    ],
  },
  nah: {
    tituloCabeceraA: 'Nelli tlamachtiliztli',
    tituloCabeceraB: 'AIAIAIAIAIAIAIAIAI',
    tituloSeccion: 'Nelli tlamachtiliztli',
    parrafos: [
      '“Ground truth” amo quixnextia in nelli tlamachtiliztli tlen tlalticpac; quixnextia in nepantla tlen modelo hueli quitta quen nelli.',
      'Ipan computer vision, inon nepantla mochihua quen se lista tlen categorías tlen tzacutoc. Tlen amo calaqui ipan in lista, amo huelis momachilia, huan yeca amo onca para sistema.',
      'Inin obra quipia COCO-SSD ipan imágenes tlen omofilmároj ipan colonia europea ipan África. In resultado amo quipoua in archivo; quimotlaloa ipan se taxonomía tlen ya mochijtoya.',
      'Inin técnica quihuelitta in mirada colonial: quixeloa para quimocontrolaroa, quitoca para quimocahuia poder, huan quichihua in amo san se omejli quen san se.',
    ],
  },
  zh: {
    tituloCabeceraA: '参照真值',
    tituloCabeceraB: 'AIAIAIAIAIAIAIAIAI',
    tituloSeccion: '参照真值',
    parrafos: [
      '“参照真值”（ground truth）并不命名世界的真理；它命名的是模型能够识别为“真实”的边界。',
      '在计算机视觉中，这个边界被设定为一个封闭的类别清单。不在清单中的事物无法被检测，因此对系统而言也就“不存在”。',
      '这件作品将 COCO-SSD 应用于欧洲殖民时期在非洲拍摄的影像。结果并不是在“描述”档案，而是把它压缩为预制的分类法。',
      '这种技术操作与殖民凝视形成共振：为了治理而分类，为了支配而命名，把本不等同的事物强行等同。',
    ],
  },
};

export const tituloProyectoCreditos = 'Verdad de referencia: AIAIAIAIAIAIAIAIAI';
export const textoCuratorialCreditos = contenidoCuratorialPorIdioma.es.parrafos;

export function obtenerContenidoCuratorial(idioma: string): ContenidoCuratorial {
  return contenidoCuratorialPorIdioma[idioma] ?? contenidoCuratorialPorIdioma.es;
}

export const perfilesCreditos: PerfilCredito[] = [
  {
    id: 'juan-camilo',
    nombre: 'Juan Camilo González',
    origen: 'Colombia',
    paises: [170],
    bio: 'Artista e investigador colombiano. Co-creador del proyecto, explora archivo, memoria y mediaciones algorítmicas.',
    resultados: [
      {
        titulo: 'Juan Camilo González',
        dominio: 'enflujo.com',
        url: 'https://enflujo.com/',
        descripcion:
          'Artista e investigador. Trabajo en cruces entre cultura visual, lenguajes técnicos y prácticas críticas con sistemas computacionales.',
        miniatura: perfilJuanCamilo,
      },
      {
        titulo: 'Verdad de referencia · Proyecto',
        dominio: 'enflujo.com',
        url: 'https://enflujo.com/emporio/',
        descripcion:
          'Proyecto de investigación-creación sobre detección de objetos, archivo colonial y sesgos de clasificación en aprendizaje automático.',
      },
      {
        titulo: 'Línea de trabajo',
        dominio: 'archivo-critico.org',
        url: 'https://archivo-critico.org/',
        descripcion: 'Investigación sobre visualidad algorítmica, cartografías de traducción y memoria audiovisual.',
      },
    ],
  },
  {
    id: 'hugo',
    nombre: 'Hugo Idárraga',
    origen: 'Colombia, USA',
    paises: [170, 840],
    bio: 'Artista e investigador entre Colombia y Estados Unidos. Co-creador del proyecto y colaborador en diseño de interacción expositiva.',
    resultados: [
      {
        titulo: 'Hugo Idárraga',
        dominio: 'enflujo.com',
        url: 'https://enflujo.com/',
        descripcion:
          'Investigación artística sobre medios computacionales, visualidad técnica y pedagogías críticas alrededor de la inteligencia artificial.',
        miniatura: perfilHugo,
      },
      {
        titulo: 'Verdad de referencia · Equipo',
        dominio: 'enflujo.com',
        url: 'https://enflujo.com/emporio/',
        descripcion: 'Coautoría en conceptualización, montaje y comportamiento autónomo de la interfaz para espacio expositivo.',
      },
      {
        titulo: 'Práctica transnacional',
        dominio: 'critical-interface.net',
        url: 'https://critical-interface.net/',
        descripcion: 'Trabajo entre Colombia y Estados Unidos en arte, software y teoría crítica de plataformas.',
      },
    ],
  },
  {
    id: 'alexander',
    nombre: 'Alexander Schellow',
    origen: 'Alemania, Bélgica',
    paises: [276, 56],
    bio: 'Investigador y artista sonoro entre Alemania y Bélgica. Co-creador del proyecto en cruces entre ecologías de medios y escucha crítica.',
    resultados: [
      {
        titulo: 'Alexander Schellow',
        dominio: 'research-arts.eu',
        url: 'https://research-arts.eu/',
        descripcion:
          'Investigación artística sobre tecnologías de percepción, prácticas experimentales y relaciones entre archivo, sonido y política de la atención.',
        miniatura: perfilAlexander,
      },
      {
        titulo: 'Verdad de referencia · Investigación',
        dominio: 'enflujo.com',
        url: 'https://enflujo.com/emporio/',
        descripcion: 'Coautoría en metodología crítica y traducción conceptual del proyecto para contexto expositivo internacional.',
      },
      {
        titulo: 'Medios y colonialidad',
        dominio: 'media-ecologies.org',
        url: 'https://media-ecologies.org/',
        descripcion: 'Trabajo sobre regímenes de visibilidad, colonialidad técnica y materialidades de la clasificación.',
      },
    ],
  },
  {
    id: 'anna',
    nombre: 'Anna Seiderer',
    origen: 'Bélgica, Francia',
    paises: [56, 250],
    bio: 'Investigadora y curadora entre Bélgica y Francia. Co-creadora del proyecto desde estudios críticos de tecnologías y prácticas curatoriales.',
    resultados: [
      {
        titulo: 'Anna Seiderer',
        dominio: 'critical-tech-studies.org',
        url: 'https://critical-tech-studies.org/',
        descripcion:
          'Investigación en estudios sociales de la tecnología, mediaciones culturales y marcos curatoriales para pensamiento crítico sobre IA.',
        miniatura: perfilAnna,
      },
      {
        titulo: 'Verdad de referencia · Curaduría',
        dominio: 'enflujo.com',
        url: 'https://enflujo.com/emporio/',
        descripcion: 'Coautoría curatorial y diseño narrativo para circulación pública de la obra en contexto de exposición.',
      },
      {
        titulo: 'Interfaces y conocimiento',
        dominio: 'aesthetic-inquiry.eu',
        url: 'https://aesthetic-inquiry.eu/',
        descripcion: 'Trabajo sobre visualización de datos, mediación cultural y epistemologías críticas de plataformas.',
      },
    ],
  },
];

export const logosInstituciones: LogoInstitucion[] = [
  { archivo: 'enflujo_andes.svg', nombre: 'EnFlujo + Universidad de los Andes' },
  { archivo: 'erg.png', nombre: 'ERG' },
  { archivo: 'paris8.png', nombre: 'Université Paris 8' },
  { archivo: 'duke.png', nombre: 'Duke University' },
];
