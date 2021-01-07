import React from 'react';

import { View } from 'react-native';

import Svg, { Path, Defs, LinearGradient, Stop, G, Rect, Ellipse } from 'react-native-svg';

const SvgBackground = ({ style }) => (
  <View style={style}>
    <Svg width="1242" height="2688" viewBox={`0 0 1242 2688`} preserveAspectRatio="xMinYmin meet">
      <Defs>
        <LinearGradient y2="0" x2="0.5" y1="1" x1="0.5" id="svg_1">
          <Stop offset="0" stopOpacity="0.99609" stopColor="#ffe9d3" />
          <Stop offset="1" stopOpacity="0.99609" stopColor="#f7f4ed" />
        </LinearGradient>
      </Defs>
      <G>
        <Rect fill="url(#svg_1)" id="canvas_background" height="2690" width="1244" y="-1" x="-1" />
        <G display="none" overflow="visible" y="0" x="0" height="100%" width="100%" id="canvasGrid">
          <Rect fill="url(#gridpattern)" strokeWidth="0" y="0" x="0" height="100%" width="100%" />
        </G>
      </G>
      <G>
        <Ellipse
          stroke="#000"
          ry="557.99648"
          rx="557.99648"
          id="svg_2"
          cy="399.81837"
          cx="976.99778"
          strokeWidth="0"
          fill="url(#svg_1)"
        />
        <Ellipse
          ry="541.99659"
          rx="541.99659"
          id="svg_4"
          cy="2087.80776"
          cx="81.0034"
          fillOpacity="null"
          strokeOpacity="null"
          strokeWidth="0"
          stroke="#000"
          fill="url(#svg_1)"
        />
        <Ellipse
          ry="121.99923"
          rx="121.99923"
          id="svg_5"
          cy="1351.81239"
          cx="972.99779"
          fillOpacity="null"
          strokeOpacity="null"
          strokeWidth="0"
          stroke="#000"
          fill="url(#svg_1)"
        />
      </G>
    </Svg>
  </View>
);

export default SvgBackground;
