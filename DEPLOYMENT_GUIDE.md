# คู่มือการติดตั้งและขึ้นระบบใช้งานจริง (Production Deployment Guide)
## วิทยาลัยสงฆ์พ่อขุนผาเมือง เพชรบูรณ์ (MCU PKPM CMS)

คู่มือนี้สรุปขั้นตอนและมาตรฐานสำหรับการนำระบบ **MCU PKPM Content Management System** ขึ้นใช้งานบนสภาพแวดล้อมจริง (Production Environment) เพื่อความเสถียร ประสิทธิภาพ และความปลอดภัยสูงสุด

---

## 1. ข้อมูลสถาปัตยกรรมระบบ (System Architecture)

- **Frontend & Admin UI**: React 19 + TypeScript + Tailwind CSS (Vite Engine)
- **Backend Service**: Node.js + Express Server (CommonJS Bundled via esbuild)
- **Database Engine**: Relational JSON Engine / File DB / SQLite Compatible Schema
- **Media & Assets Engine**: Local Uploads Storage with Auto Compression, WebP Support & Static Caching

---

## 2. ข้อกำหนดระบบขั้นต่ำ (System Requirements)

- **Operating System**: Ubuntu 22.04 LTS / Debian 12 / Rocky Linux 9 / RHEL / Cloud Linux (cPanel/Plesk)
- **Node.js**: Version 18.x หรือ 20.x LTS ขึ้นไป
- **Memory (RAM)**: ขั้นต่ำ 1 GB (แนะนำ 2 GB ขึ้นไป)
- **Disk Space**: ขั้นต่ำ 10 GB (ขึ้นอยู่กับขนาดไฟล์สื่อและเอกสารแนบ)
- **Process Manager**: PM2 หรือ Systemd
- **Web Server**: Nginx หรือ Apache (Reverse Proxy)

---

## 3. การแยกสภาพแวดล้อม (Environment Configuration)

ระบบปฏิเสธการใช้ข้อมูลทดสอบ บัญชีทดสอบ หรือ API Key ร่วมกันระหว่าง Development และ Production โดยเด็ดขาด

### 3.1 คัดลอกและตั้งค่า `.env` สำหรับ Production

```bash
cp .env.example .env
nano .env
```

### 3.2 ตัวอย่างค่าคอนฟิกสำคัญใน Production:

```env
NODE_ENV=production
PORT=3000

APP_URL=https://phetchabun.mcu.ac.th
ALLOWED_ORIGINS=https://phetchabun.mcu.ac.th,https://www.phetchabun.mcu.ac.th

# สุ่มรหัสลับรัดกุมความยาวอย่างน้อย 64 ตัวอักษร
JWT_SECRET=x9fA2mP7kL0qR4sV8wN1zT5yB3cH6jD2eG4uI9oK1lM3nO5pQ7rT0vX2yZ4aB6cC

COOKIE_SECURE=true
FORCE_HTTPS=true

# กำหนดบัญชี Super Admin ใหม่สำหรับ Production
INITIAL_ADMIN_USERNAME=mcu_admin_prod
INITIAL_ADMIN_PASSWORD=PhetchabunMCU#2026!Secure
INITIAL_ADMIN_EMAIL=admin.mbc@mcu.ac.th
INITIAL_ADMIN_FULLNAME=ผู้ดูแลระบบสารสนเทศ วิทยาลัยสงฆ์พ่อขุนผาเมือง

DB_FILE_PATH=./data/mcu_database.json
UPLOADS_DIR=./public/uploads
MAX_FILE_SIZE_MB=20
```

---

## 4. ขั้นตอนการเตรียมฐานข้อมูลเริ่มต้น (Database Migration & Seeder)

สั่งรันคำสั่ง Seeder เพื่อสร้างโครงสร้างตารางฐานข้อมูลและตั้งค่าผู้ดูแลระบบแรกเริ่มโดยไม่มีข้อมูลทดสอบ:

```bash
# 1. ติดตั้ง Dependencies
npm install --production=false

# 2. รัน Seeder สร้างตารางและ Super Admin บัญชีแรก
npm run seed

# 3. คอมไพล์โปรเจกต์เป็น Production Build
npm run build
```

---

## 5. การตั้งค่าไดเรกทอรีและการกำหนดสิทธิ์ (Permissions & Storage)

### 5.1 กำหนดสิทธิ์ไดเรกทอรี Uploads และ Data

```bash
# กำหนดเจ้าของโฟลเดอร์ให้เป็นเว็บเซิร์ฟเวอร์
chown -R www-data:www-data /var/www/mcu-pkpm

# กำหนดสิทธิ์ Directory เป็น 755 และ File เป็น 644
find /var/www/mcu-pkpm -type d -exec chmod 755 {} \;
find /var/www/mcu-pkpm -type f -exec chmod 644 {} \;

# ป้องกันสิทธิ์การรัน Script ในโฟลเดอร์ Uploads
chmod -R 755 /var/www/mcu-pkpm/public/uploads
```

---

## 6. การตั้งค่าเว็บเซิร์ฟเวอร์ Nginx & SSL (HTTPS Configuration)

สร้างไฟล์คอนฟิก Nginx `/etc/nginx/sites-available/mcu-phetchabun.conf`:

```nginx
server {
    listen 80;
    server_name phetchabun.mcu.ac.th www.phetchabun.mcu.ac.th;

    # บังคับ เปลี่ยนเปลี่ยนเป็น HTTPS ทั้งหมด
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name phetchabun.mcu.ac.th www.phetchabun.mcu.ac.th;

    # SSL Certificates
    ssl_certificate /etc/letsencrypt/live/phetchabun.mcu.ac.th/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/phetchabun.mcu.ac.th/privkey.pem;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Maximum Upload File Size
    client_max_body_size 50M;

    # Serve Uploaded Static Files with Caching
    location /uploads/ {
        alias /var/www/mcu-pkpm/public/uploads/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
        access_log off;
    }

    # Proxy Requests to Node.js Backend Engine
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

เปิดใช้งาน Nginx Site และติดตั้ง SSL จาก Let's Encrypt:

```bash
sudo ln -s /etc/nginx/sites-available/mcu-phetchabun.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# ออกใบรับรอง SSL
sudo certbot --nginx -d phetchabun.mcu.ac.th -d www.phetchabun.mcu.ac.th
```

---

## 7. การบริหารกระบวนการด้วย PM2 (Process Management)

ติดตั้งและสั่งรันระบบ Node.js ในโหมด Daemon Background Process:

```bash
# ติดตั้ง PM2 ทั่วทั้งระบบ
npm install -g pm2

# สั่งรันแอปพลิเคชัน
pm2 start dist/server.cjs --name "mcu-pkpm-app" --env production

# บันทึกสถานะ PM2 ให้รันอัตโนมัติเมื่อรีบูตเซิร์ฟเวอร์
pm2 save
pm2 startup
```

---

## 8. การอัปโหลดผ่าน FTP / cPanel / Plesk Hosting

กรณีโฮสติ้งเป็นแบบ cPanel / Plesk / FTP:

1. สั่งรัน `npm run build` บนเครื่องท้องถิ่นหรือ CI/CD Pipeline
2. อัปโหลดโฟลเดอร์ต่อไปนี้ไปยังโฮสติ้งผ่าน FTP:
   - `dist/` (ประกอบด้วย `server.cjs` และไฟล์ Assets ทั้งหมด)
   - `public/` (สำหรับเก็บสื่อรูปภาพและไฟล์อัปโหลด)
   - `package.json`
   - `.env` (ปรับแก้เป็นค่า Production)
3. ใน cPanel / Node.js App Selector:
   - ตั้งค่า **Application root**: `/public_html` หรือโฟลเดอร์แอป
   - **Application startup file**: `dist/server.cjs`
   - กดปุ่ม **Run npm install** และ **Restart Application**
