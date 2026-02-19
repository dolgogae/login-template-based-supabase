# Google AdMob 설정 가이드

모바일 앱(Android / iOS)에 Google AdMob 광고를 연동하는 방법입니다.

---

## 1. AdMob 계정 생성

1. [Google AdMob](https://admob.google.com) 접속 후 Google 계정으로 로그인
2. 국가/지역, 결제 정보 입력 → 계정 생성 완료

---

## 2. 앱 등록 및 App ID 발급

1. AdMob 대시보드 → **앱** → **앱 추가**
2. Android와 iOS를 **각각** 별도로 등록
3. 앱 스토어에 아직 등록되지 않은 경우 **"아니요"** 선택 후 이름만 입력
4. 각 앱의 **앱 ID** 복사 (형식: `ca-app-pub-XXXXXXXXXX~XXXXXXXXXX`)

---

## 3. 광고 단위(Ad Unit) 생성

앱 등록 후, 앱별로 광고 단위를 생성합니다.

| 광고 유형 | 설명 | 생성 위치 |
|----------|------|---------|
| **배너** | 화면 하단에 고정 표시 | 앱 → 광고 단위 → 배너 |
| **전면** | 화면 전체 표시 | 앱 → 광고 단위 → 전면 광고 |
| **보상형** | 사용자가 광고 시청 후 보상 수령 | 앱 → 광고 단위 → 보상형 |

각 광고 단위 생성 후 **광고 단위 ID** 복사 (형식: `ca-app-pub-XXXXXXXXXX/XXXXXXXXXX`)

---

## 4. 환경변수 설정

`apps/mobile/.env`에 발급받은 ID를 입력합니다:

```bash
EXPO_PUBLIC_ADS_ADMOB_ENABLED=true

# App ID (앱 등록 시 발급)
EXPO_PUBLIC_ADS_ADMOB_ANDROID_APP_ID=ca-app-pub-XXXXXXXXXX~XXXXXXXXXX
EXPO_PUBLIC_ADS_ADMOB_IOS_APP_ID=ca-app-pub-XXXXXXXXXX~XXXXXXXXXX

# 배너 광고 단위 ID
EXPO_PUBLIC_ADS_ADMOB_BANNER_ANDROID=ca-app-pub-XXXXXXXXXX/XXXXXXXXXX
EXPO_PUBLIC_ADS_ADMOB_BANNER_IOS=ca-app-pub-XXXXXXXXXX/XXXXXXXXXX

# 전면 광고 단위 ID
EXPO_PUBLIC_ADS_ADMOB_INTERSTITIAL_ANDROID=ca-app-pub-XXXXXXXXXX/XXXXXXXXXX
EXPO_PUBLIC_ADS_ADMOB_INTERSTITIAL_IOS=ca-app-pub-XXXXXXXXXX/XXXXXXXXXX

# 보상형 광고 단위 ID
EXPO_PUBLIC_ADS_ADMOB_REWARDED_ANDROID=ca-app-pub-XXXXXXXXXX/XXXXXXXXXX
EXPO_PUBLIC_ADS_ADMOB_REWARDED_IOS=ca-app-pub-XXXXXXXXXX/XXXXXXXXXX
```

---

## 5. app.json 업데이트

`apps/mobile/app.json`의 AdMob 플러그인 설정에 실제 App ID를 입력합니다:

```json
{
  "expo": {
    "plugins": [
      ["react-native-google-mobile-ads", {
        "androidAppId": "ca-app-pub-XXXXXXXXXX~XXXXXXXXXX",
        "iosAppId": "ca-app-pub-XXXXXXXXXX~XXXXXXXXXX"
      }]
    ]
  }
}
```

> **중요**: `app.json`의 App ID는 `EXPO_PUBLIC_ADS_ADMOB_*_APP_ID` 환경변수와 동일한 값이어야 합니다.

---

## 6. 빌드

AdMob은 네이티브 코드가 필요하므로 **Expo Go에서는 동작하지 않습니다**.
반드시 EAS Build 또는 네이티브 빌드를 사용해야 합니다.

```bash
# EAS Build (권장)
eas build --platform android
eas build --platform ios

# 또는 로컬 빌드
npx expo prebuild
npx expo run:android
npx expo run:ios
```

---

## 7. 컴포넌트 사용법

### 배너 광고

```tsx
import { AdMobBanner } from "@/components/ads/AdMobBanner";

export default function HomeScreen() {
  return (
    <View>
      {/* 콘텐츠 */}
      <AdMobBanner />  {/* ADMOB_ENABLED=false 시 null 반환 */}
    </View>
  );
}
```

### 전면 광고

```tsx
import { useAdMobInterstitial } from "@/components/ads/useAdMobInterstitial";

export default function GameScreen() {
  const { load, show, isLoaded } = useAdMobInterstitial();

  useEffect(() => { load(); }, []);

  const handleLevelComplete = async () => {
    if (isLoaded) await show();
    // 게임 다음 단계 진행
  };
  // ...
}
```

### 보상형 광고

```tsx
import { useAdMobRewarded } from "@/components/ads/useAdMobRewarded";

export default function ShopScreen() {
  const { load, show, isLoaded } = useAdMobRewarded({
    onRewarded: (reward) => {
      console.log(`보상: ${reward.type} x${reward.amount}`);
      // 보상 지급 로직
    }
  });

  useEffect(() => { load(); }, []);

  return (
    <Button title="광고 보고 코인 받기" onPress={() => show()} disabled={!isLoaded} />
  );
}
```

---

## 8. 테스트 광고 ID

`EXPO_PUBLIC_ADS_ADMOB_ENABLED=false`이거나 개별 Ad Unit ID가 미설정된 경우,
Google 공식 테스트 ID가 자동으로 사용됩니다.

| 유형 | Android 테스트 ID | iOS 테스트 ID |
|------|-----------------|--------------|
| 배너 | `ca-app-pub-3940256099942544/6300978111` | `ca-app-pub-3940256099942544/2934735716` |
| 전면 | `ca-app-pub-3940256099942544/1033173712` | `ca-app-pub-3940256099942544/4411468910` |
| 보상형 | `ca-app-pub-3940256099942544/5224354917` | `ca-app-pub-3940256099942544/1712485313` |

> 실제 배포 빌드에서는 **반드시 실제 Ad Unit ID를 사용**하세요.
> 테스트 ID로 실제 수익은 발생하지 않습니다.

---

## 참고

- [react-native-google-mobile-ads 공식 문서](https://docs.page/invertase/react-native-google-mobile-ads)
- [AdMob 정책](https://support.google.com/admob/answer/6128543)
