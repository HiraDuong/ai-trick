# 5. AI Failure Cases

Muc tieu: ghi nhan nhung truong hop AI tao ra output sai, khong dung duoc, hoac gay mat thoi gian. Tai lieu nay tap trung vao cac loi trong qua trinh phan tich, trien khai, xac minh, va quan ly artifact cua AI trong session hien tai.

## Overview

Trong session nay, cac loi cua AI khong nam o mot bug logic don le, ma chu yeu roi vao 4 nhom:

1. Xac nhan qua som khi chua tai hien dung boi canh UI that.
2. Sua chua chua den goc re cua van de, dan den user van thay loi cu.
3. Dua vao artifact moi gay unstable build/runtime trong luc dang sua.
4. Quan ly file bug/report chua nhat quan, tao ra sai lech numbering va mat thoi gian doi ten lai.

Nhung failure case duoi day la cac truong hop co tac dong ro rang den chat luong output hoac lam user phai nhac lai van de.

---

## Case 1. Xac nhan sai vi tri va boi canh cua chuc nang Bookmark/Add Tag

### Issue
AI da tra loi va xac nhan task 37 theo huong "feature da co tren UI", trong khi user van khong nhin thay nut Add Tag va dang nham lan giua:

- link Bookmarks o navbar
- action bookmark cua bai viet trong trang article detail

Dieu nay lam cho user co cam giac AI dang xac nhan mot UI ma user khong he thay tren man hinh.

### Cause (root cause)
- AI dua vao code va mot lan validation truoc do, nhung khong khoa lai dung context UI hien tai cua user.
- AI khong tach bach ro rang giua route `/bookmarks` va route `/articles/[articleId]` truoc khi ket luan.
- AI bo qua kha nang mat session/auth sau khi restart frontend, dan den snapshot thuc te khac voi nhung gi AI mo ta.

### How Detected
- User phan hoi truc tiep rang "hoan toan khong co" va sau do hoi tiep "van chua thay nut add new tag o dau".
- Snapshot browser tai mot so thoi diem chi hien navbar hoac page chua login, khong hien phan action ma AI vua mo ta.

### Resolution
- Xac dinh lai route dung la `/articles/[articleId]`, khong phai `/bookmarks`.
- Login lai bang author account va mo dung article detail page de kiem tra.
- Chi ro vi tri chuc nang trong UI va sau do dieu chinh CSS de Add Tag de nhin hon.

### Impact
- Gay mat thoi gian do user phai hoi lai nhieu lan.
- Lam giam do tin cay cua phan validation UI do AI bao "da co" trong khi user chua the nhin thay.

---

## Case 2. Fix active button chua giai quyet dung bug user report

### Issue
AI da sua active state cho bookmark action trong article detail, nhung user report bug active button o header nav, dac biet la trang `/bookmarks` van hien `Open archive` nhu dang active.

Noi cach khac, AI sua mot van de co lien quan, nhung khong sua dung van de user dang noi.

### Cause (root cause)
- AI dien giai issue theo huong "detail action active state" thay vi kiem tra HTML/CSS ma user dua ra.
- Trong `main-layout.tsx`, active style cua nav dang bi hard-code, nhung AI luc dau tap trung vao article detail action button.
- Chua doi chieu lai code header nav truoc khi ket luan bug da fix.

### How Detected
- User gui lai HTML cua header nav va noi ro bug active button van chua fix.
- Kiem tra code cho thay `Open archive` duoc gan class active bat ke route hien tai.

### Resolution
- Them route-aware active logic cho header nav.
- Chuyen active state cua nav dua theo `usePathname()`.
- Reload va verify lai route `/bookmarks` sau khi sua.

### Impact
- Lam user phai chi ra bug lan hai, thay vi ket thuc sau lan fix dau.
- Cho thay AI da fix theo "gia dinh" chua phai theo evidence cua UI that.

---

## Case 3. Tao helper file moi gay vo frontend build trong qua trinh fix

### Issue
Trong luc sua nav active va content preview, AI tao them:

- `header-primary-nav.tsx`
- `content-preview.ts`

Sau do frontend dev server bat dau bao loi `Module not found`, khien route `/bookmarks` tro nen khong on dinh va tang chi phi debug.

### Cause (root cause)
- AI chon cach tach helper thanh file moi de code dep hon, nhung khong can nhac ky tinh on dinh cua Turbopack/HMR trong state hien tai.
- Khi co dau hieu build/runtime dang nhay cam, cach tao module moi lam tang rui ro resolution/cache mismatch.
- Day la mot quyet dinh ky thuat chua toi uu cho boi canh session dang co nhieu restart frontend.

### How Detected
- Browser console va dev server output bao lap lai `Module not found` cho ca 2 file moi.
- Route `/bookmarks` co luc van tra 200 nhung snapshot va console cho thay build khong sach.

### Resolution
- Kiem tra su ton tai that cua file tren disk.
- Xac dinh van de nam o import/runtime path thay vi file bi mat.
- Loai bo hai module moi, inline logic tro lai vao cac file cu:
  - inline nav logic trong `main-layout.tsx`
  - inline preview-cleaning logic trong `bookmarks-view.tsx`
- Restart lai frontend de dua build ve trang thai on dinh.

### Impact
- Tao them mot failure case do AI gay ra trong luc dang fix bug khac.
- Lam mat thoi gian vi user phai cho AI debug build issue moi.

---

## Case 4. Quan ly numbering cua bug file chua nhat quan

### Issue
AI da tao file `bug5`, `bug6` va `ikp-bug5`, `ikp-bug6`, trong khi user sau do can bo so bug theo logic `bug3`, `bug4`.

Ve ban chat, output nay khong sai noi dung, nhung sai artifact convention va gay them cong viec doi ten lai.

### Cause (root cause)
- AI tao bug file theo numbering phat sinh trong luc lam viec, thay vi verify numbering convention hien co trong thu muc `prompt/bug-issue`.
- AI khong kiem tra lich su ton tai cua bug 3 va 4 truoc khi dat so cho bug moi.

### How Detected
- User hoi truc tiep "co ma file bug 3,4 dau nhi".
- Search trong workspace cho thay khong con bug 3,4; sau do user yeu cau doi bug 5,6 ve 3,4 neu khong tim thay trong history.

### Resolution
- Kiem tra git history va workspace hien tai.
- Xac nhan bug 3 va 4 khong ton tai trong history duoc tim thay.
- Doi ten artifact tu bug 5,6 ve bug 3,4 va cap nhat noi dung tieu de cho dong bo.

### Impact
- Tao them thao tac quan ly file khong can thiet.
- Lam user phai nhac AI sua lai artifact thay vi tiep tuc task chinh.

---

## Case 5. Validation UI bi anh huong boi auth/session drift sau restart

### Issue
Sau khi restart frontend, UI tren browser co luc quay ve `Log in`, trong khi AI van tiep tuc xac nhan mot so state can session author nhu Add Tag, bookmark, bookmark list, hoac auth control.

AI co luc dua ra ket luan dung ve code, nhung chua dam bao browser dang o dung auth state de user review ngay lap tuc.

### Cause (root cause)
- Session cua frontend duoc luu ket hop giua localStorage va cookie, de bi lech sau reload/restart.
- AI da co token hop le trong terminal, nhung viec dua token vao browser va dong bo SSR/client state chua luon on dinh.
- AI tra loi theo "code state" nhanh hon "review state" tren browser.

### How Detected
- Snapshot browser sau reload chi hien `Log in` thay vi action dang nhap.
- User tiep tuc noi rang van khong thay nut Add Tag hoac UI khong dung voi nhung gi AI mo ta.

### Resolution
- Re-login bang account seeded author.
- Dieu huong lai den dung route article detail.
- Tach ro khi nao la validation code, khi nao la validation browser state.
- Tranh xac nhan UI da san sang review neu browser dang mat session.

### Impact
- Lam giam gia tri cua viec "frontend ready for review" du code da duoc sua.
- Buoc AI phai lap lai mot so thao tac login/reload va giai thich lai UI cho user.

---

## Lessons Learned

1. Khong xac nhan UI feature neu chua khoa lai dung route, dung role, va dung auth state tren browser.
2. Khi user dua HTML/CSS hoac screenshot cu the, phai fix theo bang chung do, khong duoc suy dien tu issue gan giong.
3. Trong session dang co dau hieu HMR/Turbopack khong on dinh, uu tien sua inline trong file cu thay vi tao module moi.
4. Truoc khi tao bug artifact moi, phai kiem tra numbering convention va file ton tai trong thu muc bug.
5. Validation cho user review phai dua tren browser state that, khong chi dua tren code hoac terminal output.

## Conclusion

Nhung AI failure case nay khong phai la loi thiet ke kien truc lon, nhung chung la cac truong hop dien hinh ve:

- xac nhan qua som,
- sua chua lech issue,
- tao regression trong luc fix,
- va artifact management chua chat.

Day la nhung diem phu hop de dua vao phan danh gia kha nang phan doan, kha nang debug, va cach team kiem soat output cua AI.