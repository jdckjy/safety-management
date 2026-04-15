
import React, { useMemo } from 'react';
import { geoPath, geoMercator } from 'd3-geo';
import { feature } from 'topojson-client';
import { useTooltip, TooltipWithBounds } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { GeometryCollection } from 'topojson-specification';

import topology from '../data/jeju-municipalities-topo.json';

interface PopulationData {
  region: string;
  subRegion: string;
  total: string;
}

interface JejuPopulationMapProps {
  jejuData: PopulationData | undefined;
  seogwipoData: PopulationData | undefined;
  width?: number;
  height?: number;
}

const KOREA_OBJECT_NAME = 'jeju_submunicipalities';

const JejuPopulationMap: React.FC<JejuPopulationMapProps> = ({
  jejuData,
  seogwipoData,
  width = 500,
  height = 500,
}) => {
  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip<PopulationData & { subRegionName: string }>();

  const jejuFeatures = useMemo(() => {
    const geoCollection = topology.objects[KOREA_OBJECT_NAME] as GeometryCollection;
    return feature(topology as any, geoCollection).features;
  }, []);

  const projection = useMemo(() => {
    return geoMercator().fitSize([width, height], {
      type: 'FeatureCollection',
      features: jejuFeatures,
    });
  }, [width, height, jejuFeatures]);

  const path = geoPath().projection(projection);

  const handleMouseOver = (feature: any, event: React.MouseEvent<SVGPathElement>) => {
    const point = localPoint(event);
    const props = feature.properties;

    if (point && props) {
      const subRegionName = props.ADM_NM; 
      let cityData;

      if (props.ADM_CD && props.ADM_CD.startsWith('50110')) {
        cityData = jejuData;
      } else if (props.ADM_CD && props.ADM_CD.startsWith('50130')) {
        cityData = seogwipoData;
      }

      if (cityData) {
        const tooltipDisplayData = {
          ...cityData,
          subRegionName: subRegionName,
        };
        showTooltip({
          tooltipData: tooltipDisplayData,
          tooltipLeft: point.x,
          tooltipTop: point.y,
        });
      }
    }
  };

  const handleMouseOut = () => {
    setTimeout(() => {
      hideTooltip();
    }, 300);
  };

  return (
    <div style={{ position: 'relative' }}>
      <svg width={width} height={height}>
        <g>
          {jejuFeatures.map((feature: any, i) => {
            const props = feature.properties;
            let cityData;

            if (props.ADM_CD && props.ADM_CD.startsWith('50110')) {
              cityData = jejuData;
            } else if (props.ADM_CD && props.ADM_CD.startsWith('50130')) {
              cityData = seogwipoData;
            }

            return (
              <path
                key={`map-feature-${i}`}
                d={path(feature) || ''}
                fill={cityData ? '#88B04B' : '#ccc'}
                stroke="white"
                strokeWidth={0.5}
                onMouseOver={e => handleMouseOver(feature, e)}
                onMouseOut={handleMouseOut}
              />
            );
          })}
        </g>
      </svg>
      {tooltipOpen && tooltipData && tooltipLeft && tooltipTop && (
        <TooltipWithBounds
          key={Math.random()}
          top={tooltipTop}
          left={tooltipLeft}
          style={{
            backgroundColor: 'white',
            color: 'black',
            padding: '5px',
            borderRadius: '3px',
            boxShadow: '0 0 5px rgba(0,0,0,0.3)',
          }}
        >
          <h4>{tooltipData.subRegionName}</h4>
          <p>총 인구 ({tooltipData.subRegion}): {parseInt(tooltipData.total).toLocaleString()}</p>
        </TooltipWithBounds>
      )}
    </div>
  );
};

export default JejuPopulationMap;
