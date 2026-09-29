import kitImg from '../assets/images/kit.png';
import leverImg from '../assets/images/lever.png';
import caliperImg from '../assets/images/caliper.png';
import rotorImg from '../assets/images/rotor.png';
import guardImg from '../assets/images/guard.png';
import plateCleanImg from '../assets/images/plate_clean.svg';
import plateStickerImg from '../assets/images/plate_sticker.svg';
import plateZiptiesImg from '../assets/images/plate_zipties.svg';

export const FREE_SHIPPING_THRESHOLD = 399;
export const STANDARD_SHIPPING_FEE = 15;

export interface ProductVariant {
  id: string;
  name: string;
  shortName: string;
  price: number;
  badge?: string;
  image: string;
  description?: string;
}

export interface ProductComponentItem {
  id: string;
  name: string;
  shortName: string;
  image: string;
  category: string;
  description: string;
  specs: { label: string; value: string }[];
}

export interface KitContentItem {
  title: string;
  desc: string;
  image: string;
}

export interface ProductItem {
  id: string;
  name: string;
  shortName: string;
  storeName: string;
  tagline: string;
  category: string;
  badge?: string;
  isNew?: boolean;
  price: number;
  originalPrice: number;
  discount: number;
  currency: string;
  shipping: string;
  returnPolicy: string;
  shortDescription: string;
  image: string;
  variants?: ProductVariant[];
  images: {
    kit: string;
    lever?: string;
    caliper?: string;
    rotor?: string;
    guard?: string;
    plateClean?: string;
    plateSticker?: string;
    plateZipties?: string;
    [key: string]: string | undefined;
  };
  technicalSpecs: { label: string; value: string }[];
  kitContents: KitContentItem[];
  components: ProductComponentItem[];
}

export const PRODUCTS: ProductItem[] = [
  {
    id: 'ultra-bee-brakes',
    name: 'Ultra Bee Brakes',
    shortName: 'Tylny Układ Hamulcowy',
    storeName: 'Cold Customs',
    category: 'Układ Hamulcowy Tył',
    badge: 'Bestseller',
    tagline: 'Hydrauliczny motocyklowy układ hamulcowy na tył · Masywna tarcza 240 mm (3,2 mm)',
    price: 799,
    originalPrice: 849,
    discount: 50,
    currency: 'zł',
    shipping: 'Darmowa wysyłka (od 399 zł gratis)',
    returnPolicy: '14 dni na bezproblemowy zwrot',
    shortDescription:
      'W pełni hydrauliczny układ hamulcowy na tył o standardzie motocyklowym. Zapewnia potężną siłę docisku i stabilność cieplną w terenie. W zestawie z masywną wentylowaną tarczą 240 mm o grubości 3,2 mm oraz aluminiowym zaciskiem dwutłoczkowym.',
    image: kitImg,
    images: {
      kit: kitImg,
      lever: leverImg,
      caliper: caliperImg,
      rotor: rotorImg,
      guard: guardImg,
    },
    technicalSpecs: [
      { label: 'Typ układu', value: 'Hydrauliczny (standard motocyklowy)' },
      { label: 'Strona montażu', value: 'Tył (lewa klamka na kierownicę)' },
      { label: 'Tarcza w zestawie', value: 'Średnica 240 mm / grubość 3,2 mm' },
      { label: 'Zacisk', value: 'Aluminiowy, dwutłoczkowy' },
      { label: 'Płyn hamulcowy', value: 'DOT 4 / DOT 5.1' },
      { label: 'Przewód', value: 'Wzmocniony przewód ciśnieniowy' },
      { label: 'Klocki hamulcowe', value: 'W zestawie z zaciskiem' },
      { label: 'Gwarancja / zwrot', value: '14 dni na bezproblemowy zwrot' },
      { label: 'Dostawa', value: '0 zł – darmowa wysyłka (kwota powyżej 399 zł)' },
    ],
    kitContents: [
      {
        title: 'Klamka hamulcowa (lewa) z pompą i zbiorniczkiem',
        desc: 'Ergonomiczna klamka z pompą i zintegrowanym zbiorniczkiem na płyn hamulcowy DOT 4 / 5.1.',
        image: leverImg,
      },
      {
        title: 'Przewód hydrauliczny (wzmocniony)',
        desc: 'Wysokociśnieniowy przewód o zwiększonej sztywności objętościowej.',
        image: kitImg,
      },
      {
        title: 'Zacisk hamulcowy z klockami',
        desc: 'Aluminiowy zacisk dwutłoczkowy o dużej pojemności cieplnej z fabrycznymi klockami.',
        image: caliperImg,
      },
      {
        title: 'Wspornik / adapter montażowy zacisku',
        desc: 'Frezowany CNC wspornik ze stopu aluminium zintegrowany z osłoną.',
        image: guardImg,
      },
      {
        title: 'Tarcza hamulcowa 240 mm (grubość 3,2 mm)',
        desc: 'Gruba tarcza wentylowana o średnicy 240 mm i grubości 3,2 mm zapobiegająca przegrzewaniu.',
        image: rotorImg,
      },
    ],
    components: [
      {
        id: 'kit',
        name: 'Kompletny układ Ultra Bee Brakes',
        shortName: 'Cały zestaw',
        image: kitImg,
        category: 'Zestaw gotowy do montażu',
        description:
          'Kompletny układ hamulcowy na tył. Zestaw gotowy do montażu ze wszystkimi elementami: klamką, pompą, przewodem, zaciskiem, adapterem i tarczą 240 mm.',
        specs: [
          { label: 'Układ', value: 'W pełni hydrauliczny' },
          { label: 'Pozycja', value: 'Tył (lewa klamka)' },
          { label: 'Tarcza', value: '240 mm × 3,2 mm' },
        ],
      },
      {
        id: 'lever',
        name: 'Klamka lewa z pompą i zbiorniczkiem',
        shortName: 'Klamka & Pompa',
        image: leverImg,
        category: 'Sterowanie',
        description:
          'Klamka hamulcowa na lewą stronę kierownicy ze zintegrowaną pompą hydrauliczną i zbiorniczkiem na płyn DOT 4 / DOT 5.1.',
        specs: [
          { label: 'Montaż', value: 'Lewa klamka na kierownicę' },
          { label: 'Płyn roboczy', value: 'DOT 4 / DOT 5.1' },
          { label: 'Przyłącze', value: 'Wzmocniony przewód banjo' },
        ],
      },
      {
        id: 'caliper',
        name: 'Aluminiowy zacisk dwutłoczkowy',
        shortName: 'Zacisk 2-tłoczkowy',
        image: caliperImg,
        category: 'Zacisk hamulcowy',
        description:
          'Dwutłoczkowy zacisk z odlewanego aluminium z klockami w zestawie. Gwarantuje mocny docisk klocków i wysoką odporność na przegrzewanie w terenie.',
        specs: [
          { label: 'Konstrukcja', value: 'Aluminiowy, dwutłoczkowy' },
          { label: 'Klocki', value: 'W zestawie' },
          { label: 'Odpowietrznik', value: 'Z gumową osłonką' },
        ],
      },
      {
        id: 'rotor',
        name: 'Gruba tarcza hamulcowa 240 mm',
        shortName: 'Tarcza 240 mm',
        image: rotorImg,
        category: 'Tarcza hamulcowa',
        description:
          'Wentylowana tarcza hamulcowa ze stali nierdzewnej o średnicy 240 mm i grubości 3,2 mm. Grubość zapobiega przegrzewaniu i skrzywieniom w trudnych warunkach.',
        specs: [
          { label: 'Średnica', value: '240 mm' },
          { label: 'Grubość', value: '3,2 mm' },
          { label: 'Mocowanie', value: '6 śrub montażowych' },
        ],
      },
      {
        id: 'guard',
        name: 'Wspornik / adapter montażowy zacisku',
        shortName: 'Wspornik CNC',
        image: guardImg,
        category: 'Mocowanie zacisku',
        description:
          'Solidny wspornik i adapter montażowy wycinany CNC ze stopu aluminium w kolorze czarnym z charakterystycznymi otworami heksagonalnymi.',
        specs: [
          { label: 'Materiał', value: 'Aluminium anodowane' },
          { label: 'Konstrukcja', value: 'Ażurowy plaster miodu' },
          { label: 'Zastosowanie', value: 'Sztywne mocowanie zacisku' },
        ],
      },
    ],
  },
  {
    id: 'front-plate-cold-customs',
    name: 'Vented Plate Cold Customs',
    shortName: 'Vented Plate',
    storeName: 'Cold Customs',
    category: 'Tablica przednia / Owiewka',
    badge: 'Nowość',
    isNew: true,
    tagline: 'Sportowa tablica przednia Vented Plate ze zintegrowanymi siatkami wlotów powietrza',
    price: 149,
    originalPrice: 200,
    discount: 51,
    currency: 'zł',
    shipping: 'Darmowa wysyłka od 399 zł (standard 15 zł)',
    returnPolicy: '14 dni na bezproblemowy zwrot',
    shortDescription:
      'Lekka i odporna sportowa tablica przednia Vented Plate ze zintegrowanymi metalowymi siatkami wentylacyjnymi. Do wyboru wariant czysty lub z fabrycznie zaaplikowaną okleiną Cold Customs #1. W komplecie 4 opaski montażowe (zip-ties).',
    image: plateCleanImg,
    variants: [
      {
        id: 'without-sticker',
        name: 'Bez naklejki (Czysty czarny)',
        shortName: 'Bez naklejki',
        price: 149,
        image: plateCleanImg,
        description: 'Gładka, czarna tablica Vented Plate ze zintegrowanymi siatkami.',
      },
      {
        id: 'with-sticker',
        name: 'Z okleiną Cold Customs #1',
        shortName: 'Z okleiną #1',
        price: 149,
        badge: 'Okleina w cenie',
        image: plateStickerImg,
        description: 'Z zaaplikowaną grubą okleiną wyścigową Cold Customs #1.',
      },
    ],
    images: {
      kit: plateCleanImg,
      plateClean: plateCleanImg,
      plateSticker: plateStickerImg,
      plateZipties: plateZiptiesImg,
    },
    technicalSpecs: [
      { label: 'Materiał', value: 'Wzmocniony polimer odporny na uderzenia' },
      { label: 'Wloty powietrza', value: 'Zintegrowane metalowe siatki wentylacyjne' },
      { label: 'Warianty', value: 'Czysty czarny lub z okleiną Cold Customs #1' },
      { label: 'Mocowanie w zestawie', value: '4 wzmocnione czarne opaski zaciskowe (zip-ties)' },
      { label: 'Montaż', value: 'Plug & Play bezpośrednio na lagach zawieszenia' },
      { label: 'Gwarancja / zwrot', value: '14 dni na bezproblemowy zwrot' },
    ],
    kitContents: [
      {
        title: 'Przednia tablica Vented Plate',
        desc: 'Wybrany wariant: z profesjonalnie nałożoną okleiną Cold Customs #1 lub czysty czarny.',
        image: plateStickerImg,
      },
      {
        title: 'Komplet 4 opasek zaciskowych (zip-ties)',
        desc: 'Wzmocnione czarne opaski odporne na wstrząsy, oleje i promienie UV do montażu na lagach.',
        image: plateZiptiesImg,
      },
    ],
    components: [
      {
        id: 'plate-item',
        name: 'Vented Plate Cold Customs',
        shortName: 'Tablica Vented Plate',
        image: plateCleanImg,
        category: 'Przednia owiewka',
        description:
          'Sportowa tablica przednia Vented Plate ze zintegrowanymi siatkami wlotów powietrza.',
        specs: [
          { label: 'Wersje', value: 'Czysta lub z okleiną Cold Customs #1' },
          { label: 'Tworzywo', value: 'Odporny na pęknięcia polimer' },
        ],
      },
      {
        id: 'zipties-item',
        name: 'Wzmocnione opaski montażowe (4 sztuki)',
        shortName: '4 opaski zip-tie',
        image: plateZiptiesImg,
        category: 'Elementy montażowe',
        description:
          'Zestaw 4 opasek o podwyższonej wytrzymałości do pewnego montażu na lagach.',
        specs: [
          { label: 'Ilość', value: '4 sztuki' },
          { label: 'Odporność', value: 'UV, warunki atmosferyczne i wibracje' },
        ],
      },
    ],
  },
];

export const PRODUCT_INFO = PRODUCTS[0];
