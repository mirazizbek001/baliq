# Bon-Bon — Railway deploy

Bu versiya frontend va backendni **bitta Railway service** ichida ishlatadi. `/plat/*` so‘rovlari shu domen ichida Django'ga proxy qilinadi.

## 1. Deploy

1. GitHub repo root'ini Railway'ga ulang.
2. Root Directory'ni o‘zgartirmang.
3. Root'dagi `Dockerfile` avtomatik ishlatiladi.
4. **PostgreSQL tavsiya qilinadi:** Railway loyihasiga PostgreSQL qo‘shib, web service Variables bo‘limida uning `DATABASE_URL` qiymatini ulang.
5. Muqobil: Railway Volume yarating va web service'ga `/data` manziliga ulang.

Railway production'da PostgreSQL yoki Volume sozlanmagan bo‘lsa, ilova vaqtinchalik SQLite fallback bilan ishlaydi. Bu 502 ni oldini olish uchun kerak, lekin ma'lumotlar vaqtincha saqlanadi; productionda doimiy ma'lumotlar uchun PostgreSQL yoki Volume qo‘shish tavsiya etiladi.

## 2. Variables

```text
DEBUG=0
SECRET_KEY=<uzun-maxfiy-key>
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

`DATABASE_URL` PostgreSQL xizmatiga Railway reference variable sifatida ulangan bo‘lishi kerak. PostgreSQL o‘rniga Volume ishlatsangiz `DATABASE_URL` shart emas, lekin Volume mount path `/data` bo‘lsin.

Ixtiyoriy:

```text
GOOGLE_CLIENT_ID=<Google OAuth client id>
```

## 3. Qo‘ng‘iroqlar (TURN)

Audio/video qo‘ng‘iroqlar hozirda STUN bilan ishlaydi; ayrim mobil tarmoqlar va NAT sozlamalarida ulanish uchun tashqi TURN provider kerak bo‘ladi. Railway TURN server bermaydi. Provider ma'lumotlarini Railway Variables bo‘limiga kiriting:

```text
TURN_URLS=turn:turn.example.com:3478,turns:turn.example.com:443
TURN_USERNAME=<provider username>
TURN_CREDENTIAL=<provider credential>
```

`TURN_URLS` vergul bilan ajratilgan bir yoki bir nechta `turn:`/`turns:` URL qabul qiladi. TURN sozlanmasa, ilova avvalgidek faqat Google STUN serveridan foydalanadi; bu barcha tarmoqlarda ishlashini kafolatlamaydi. TURN ma'lumotlari faqat tizimga kirgan foydalanuvchilarga beriladi, ammo WebRTC ishlashi uchun brauzerda ko‘rinishi shart. Provider cheklangan yoki muddati qisqa credential va trafik limitlarini qo‘llash tavsiya etiladi.

## 4. Health check

```text
https://SIZNING-DOMENINGIZ/health
```

Javobda:

```json
{"status":"ok","database":"postgresql","data_persistent":true}
```

bo‘lishi kerak.

## 5. Admin akkaunt yaratish

Railway deploy qilingan service Console’da:

```sh
python manage.py shell -c "from django.conf import settings; print(settings.DATABASES['default']['NAME'])"
python manage.py migrate
python manage.py createsuperuser
```

Ko‘rsatilgan database PostgreSQL bo‘lishi yoki `/data/db.sqlite3` Volume ichida joylashishi kerak. Railway production'da doimiy storage bo‘lmasa, startup ataylab xato bilan to‘xtaydi.

Ilova ichidagi boshqaruv paneli `/admin` manzilida, Django’ning texnik admin paneli esa `/django-admin/` manzilida ochiladi.

## 6. Muhim

- `BACKEND_URL` kerak emas.
- Frontend va backend bir xil domen orqali ishlaydi.
- Django session cookie 30 kun saqlanadi.
- Brauzerdagi eski login yozuvi server sessioni bilan tekshiriladi; session mavjud bo‘lsa akkaunt avtomatik tiklanadi.
- Yozishmalar `SocialState` orqali server database'ida saqlanadi.
- Railway Volume `/data` akkauntlar, sessionlar, yozishmalar va media uchun persistent storage beradi.
- PostgreSQL ishlatilsa web service uchun SQLite Volume shart emas; media uchun Volume yoki object storage kerak.
- PostgreSQL yoki `/data` Volume bo‘lmasa, Railway production deploy'i vaqtinchalik SQLite o‘rniga startup xatosi bilan to‘xtaydi.
