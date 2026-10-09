// Данные заведений. Источники: Instagram @territoriya_r, Яндекс Карты, данные от владельца.
window.CAFE = {
  brand: "Рыба Бар",
  tagline: "Территория рыбы",
  instagram: "territoriya_r",
  telegram: "",          // TODO: если есть Telegram для брони — указать ник без @
  maxGuests: 12,
  heroVideo: "",         // необязательно: путь к ролику для первого экрана (mp4, без звука, до ~4 МБ), напр. "assets/video/hero.mp4"
  locations: [
    {id:"g", short:"Горького, 6А", title:"Рыба Бар 2.0 · МОА", address:"Симферополь, ул. Горького, 6А",
     phone:"+7 (978) 167-82-13", phoneRaw:"+79781678213", whatsapp:"79781678213",
     hours:"Ежедневно, 11:00–23:00", open:11, close:23,
     yandexId:"4600049317", yandexSlug:"ryba_bar_2_0_moa", photo:"exterior-night",
     about:"Стеклянная веранда под деревьями, канаты и бумажные рыбки, витрина с устрицами и формат «Собери свой улов»."},
    {id:"sc", short:"Сергеева-Ценского, 6", title:"Рыба Бар", address:"Симферополь, ул. Сергеева-Ценского, 6",
     phone:"+7 (978) 183-39-36", phoneRaw:"+79781833936", whatsapp:"79781833936",
     hours:"Ежедневно, 11:00–23:00", open:11, close:23,
     yandexId:"146988495562", yandexSlug:"rybabar", photo:null,  // TODO: фото этого заведения
     rating:"4.9", reviews:239,
     about:"Первый Рыба Бар семьи: лазанья с красной рыбой, створки мидий в трёх соусах и «Собери свой улов»."}
  ]
};
