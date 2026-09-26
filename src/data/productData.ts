import kitImg from '../assets/images/kit.png';
import leverImg from '../assets/images/lever.png';
import caliperImg from '../assets/images/caliper.png';
import rotorImg from '../assets/images/rotor.png';
import guardImg from '../assets/images/guard.png';

export interface ProductComponentItem {
  id: string;
  name: string;
  shortName: string;
  image: string;
  category: string;
  description: string;
  specs: { label: string; value: string }[];
}

export const COMPATIBLE_MODELS = [
  { brand: 'Surron', models: 'LBX & LBS' },
  { brand: '79 Bike', models: 'Falcon Pro & Falcon GT/Lite' },
  { brand: 'E-Ride Pro', models: 'Pro S & Pro SS / 3.0' },
  { brand: 'Ventus', models: 'Wszystkie wersje' },
  { brand: 'Talaria', models: 'XXX / MX4' },
];

export const PRODUCT_INFO = {
  name: 'Ultra Bee Brakes',
  storeName: 'Cold Customs',
  tagline: 'Hydrauliczny motocyklowy układ hamulcowy na tył · Plug & Play do Surron, 79 Bike, E-Ride Pro, Ventus, Talaria',
  price: 799,
  originalPrice: 849,
  discount: 50,
  currency: 'zł',
  shipping: 'Darmowa wysyłka',
  returnPolicy: '14 dni na zwrot bez ryzyka',
  shortDescription:
    'W pełni hydrauliczny układ hamulcowy na tył o standardzie motocyklowym. Zapewnia potężną siłę docisku i stabilność cieplną w terenie. W zestawie z tarczą 240 mm (3,2 mm). Kompatybilny Plug & Play z Surron LBX & LBS, 79 Bike Falcon Pro & GT/Lite, E-Ride Pro S & Pro SS / 3.0, Ventus oraz Talaria XXX / MX4.',
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
    { label: 'Kompatybilność (Plug & Play)', value: 'Surron LBX/LBS, 79 Bike Falcon, E-Ride Pro S/SS/3.0, Ventus, Talaria XXX/MX4' },
    { label: 'Tarcza w zestawie', value: 'Średnica 240 mm / grubość 3,2 mm' },
    { label: 'Zacisk', value: 'Aluminiowy, dwutłoczkowy' },
    { label: 'Płyn hamulcowy', value: 'DOT 4 / DOT 5.1' },
    { label: 'Przewód', value: 'Wzmocniony przewód ciśnieniowy' },
    { label: 'Klocki hamulcowe', value: 'W zestawie z zaciskiem' },
    { label: 'Gwarancja zadowolenia', value: '14 dni na bezproblemowy zwrot' },
    { label: 'Dostawa', value: '0 zł – darmowa wysyłka kurierem' },
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
      desc: 'Gruba tarcza wentylowana o średnicy 240 mm i grubości 3,2 mm.',
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
};
