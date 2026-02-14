import domesticStores from '../data/domesticStores.json';
import internationalStores from '../data/internationalStores.json';
import type { DomesticStore, InternationalStore } from '../types';

export default function RetailPage() {
  const domestic = domesticStores as DomesticStore[];
  const international = internationalStores as InternationalStore[];

  return (
    <>
      <p>把握次第追加</p>

      <h3>Domestic (Japan) Stores - 日本国内の食虫専門販売業者</h3>
      <table className="hscrollable">
        <thead>
          <tr>
            <th>業者名</th>
            <th>拠点 都道府県</th>
            <th>販売形式</th>
            <th>Webサイト</th>
            <th>メモ</th>
          </tr>
        </thead>
        <tbody>
          {domestic.map((store) => (
            <tr key={store.name}>
              <th>{store.name}</th>
              <th>
                <span className="nobr">{store.location}</span>
              </th>
              <th>
                {store.types.map((type, idx) => (
                  <span key={idx}>
                    <span className="nobr">{type}</span>
                    {idx < store.types.length - 1 && <br />}
                  </span>
                ))}
              </th>
              <th>
                <span
                  className="text-content"
                  dangerouslySetInnerHTML={{ __html: store.link }}
                />
              </th>
              <th>
                <span className="nobr">{store.memo}</span>
              </th>
            </tr>
          ))}
        </tbody>
      </table>

      <p>上記以外だとヤフオクやメルカリにて多数出品有り。</p>

      <h3>Tokyo Events - 都内のイベント</h3>
      <p>TODO</p>

      <h3>Importing - 海外輸入</h3>
      <table className="hscrollable">
        <thead>
          <tr>
            <th>Name - 業者名</th>
            <th>Nation - 所在国</th>
            <th>Website - Webサイト</th>
            <th>Notes - 備考</th>
            <th>Import Log - 輸入ログ</th>
          </tr>
        </thead>
        <tbody>
          {international.map((store) => (
            <tr key={store.name}>
              <th>{store.name}</th>
              <th>
                <span className="nobr">{store.location}</span>
              </th>
              <th>
                <span
                  className="text-content"
                  dangerouslySetInnerHTML={{ __html: store.link }}
                />
              </th>
              <th>
                <span className="nobr">{store.notes}</span>
              </th>
              <th>
                <span className="nobr">{store.import_logs}</span>
              </th>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
