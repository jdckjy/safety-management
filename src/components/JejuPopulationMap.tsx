import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import * as TopoJSON from 'topojson-client';
import type { Geometry, Feature, FeatureCollection } from 'geojson';
import type { PopulationData } from '@/types/population';
import jejuTopoData from '@/data/jeju-municipalities-topo.json';
import L from 'leaflet';

// TopoJSON.feature 함수의 타입을 any로 지정하여 타입 검사를 비활성화합니다.
const feature = (TopoJSON.feature as any);
const jejuGeoData: FeatureCollection<Geometry, { ADM_NM: string }> = feature(
  jejuTopoData,
  jejuTopoData.objects.jeju_submunicipalities
);

interface JejuPopulationMapProps {
  latestPopulation: PopulationData[];
}

const getColor = (population: number | undefined) => {
  if (population === undefined) return '#f0f0f0';
  return population > 500000 ? '#800026' :
         population > 300000 ? '#BD0026' :
         population > 100000 ? '#E31A1C' :
         population > 50000  ? '#FC4E2A' :
                                '#FFEDA0';
};

export default function JejuPopulationMap({ latestPopulation }: JejuPopulationMapProps) {
  const style = (feature?: Feature<Geometry, { ADM_NM: string }>) => {
    if (!feature) return {};
    const regionName = feature.properties.ADM_NM;
    const regionData = latestPopulation.find(p => p.region.includes(regionName));
    const color = getColor(regionData?.value);

    return {
      fillColor: color,
      weight: 2,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7
    };
  };

  const onEachFeature = (feature: Feature<Geometry, { ADM_NM: string }>, layer: L.Layer) => {
    if (feature.properties && feature.properties.ADM_NM) {
      const regionName = feature.properties.ADM_NM;
      const regionData = latestPopulation.find(p => p.region.includes(regionName));
      const content = `<strong>${regionName}</strong><br/>인구: ${regionData ? regionData.value.toLocaleString() + ' 명' : '데이터 없음'}`;
      layer.bindTooltip(content);
    }
  };

  return (
    <MapContainer center={[33.361667, 126.529167]} zoom={9} style={{ height: '500px', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <GeoJSON data={jejuGeoData} style={style} onEachFeature={onEachFeature} />
    </MapContainer>
  );
}
