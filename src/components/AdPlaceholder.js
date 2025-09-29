import React, { useEffect } from 'react';

const AdPlaceholder = ({ style }) => {
  useEffect(() => {
    try {
      // window.adsbygoogle이 배열이 아니면 초기화
      if (!Array.isArray(window.adsbygoogle)) {
        window.adsbygoogle = [];
      }
      // 광고를 요청합니다.
      window.adsbygoogle.push({});
    } catch (e) {
      console.error("Adsense error:", e);
    }
  }, []);

  return (
    <div style={style}>
      <ins className="adsbygoogle"
           style={{ display: 'block' }}
           data-ad-client="ca-pub-2526415204860627"
           data-ad-slot="8183828185"
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
    </div>
  );
};

export default AdPlaceholder;
