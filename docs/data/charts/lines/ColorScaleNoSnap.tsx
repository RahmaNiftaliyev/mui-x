import * as React from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
// @ts-ignore
import HighlightedCode from 'docs/src/modules/components/HighlightedCode';

export default function ColorScaleNoSnap() {
  const [colorX, setColorX] = React.useState<
    'None' | 'piecewise' | 'continuous' | 'ordinal'
  >('None');
  const [colorY, setColorY] = React.useState<'None' | 'piecewise' | 'continuous'>(
    'piecewise',
  );

  return (
    <Stack direction="column" spacing={1} sx={{ width: '100%', maxWidth: 600 }}>
      <Stack direction="row" spacing={1}>
        <TextField
          select
          sx={{ minWidth: 150 }}
          label="x-axis colorMap"
          value={colorX}
          onChange={(event) =>
            setColorX(event.target.value as 'None' | 'piecewise' | 'continuous')
          }
        >
          <MenuItem value="None">None</MenuItem>
          <MenuItem value="piecewise">piecewise</MenuItem>
          <MenuItem value="continuous">continuous</MenuItem>
        </TextField>
        <TextField
          select
          sx={{ minWidth: 150 }}
          label="y-axis colorMap"
          value={colorY}
          onChange={(event) =>
            setColorY(event.target.value as 'None' | 'piecewise' | 'continuous')
          }
        >
          <MenuItem value="None">None</MenuItem>
          <MenuItem value="piecewise">piecewise</MenuItem>
          <MenuItem value="continuous">continuous</MenuItem>
        </TextField>
      </Stack>

      <LineChart
        height={300}
        grid={{ horizontal: true }}
        series={[
          {
            data: [-2, -9, 12, 11, 6, -4],
            area: true,
          },
        ]}
        margin={{
          top: 10,
          bottom: 20,
        }}
        yAxis={[
          {
            colorMap:
              (colorY === 'continuous' && {
                type: 'continuous',
                min: -10,
                max: 10,
                color: ['red', 'green'],
              }) ||
              (colorY === 'piecewise' && {
                type: 'piecewise',
                thresholds: [0, 10],
                colors: ['red', 'green', 'blue'],
              }) ||
              undefined,
          },
        ]}
        xAxis={[
          {
            scaleType: 'time',
            data: [
              new Date(2019, 0, 1),
              new Date(2020, 0, 1),
              new Date(2021, 0, 1),
              new Date(2022, 0, 1),
              new Date(2023, 0, 1),
              new Date(2024, 0, 1),
            ],
            valueFormatter: (value) => value.getFullYear().toString(),
            colorMap:
              (colorX === 'continuous' && {
                type: 'continuous',
                min: new Date(2019, 1, 1),
                max: new Date(2024, 1, 1),
                color: ['green', 'orange'],
              }) ||
              (colorX === 'piecewise' && {
                type: 'piecewise',
                thresholds: [new Date(2021, 1, 1), new Date(2023, 1, 1)],
                colors: ['blue', 'red', 'blue'],
              }) ||
              undefined,
          },
        ]}
      />
      <HighlightedCode
        code={[
          `<ScatterChart`,
          '  /* ... */',
          // ColorX
          ...(colorX === 'None' ? ['  xAxis={[{}]}'] : []),
          ...(colorX === 'continuous'
            ? [
                '  xAxis={[',
                `    {`,
                `      type: 'continuous',`,
                `      min: new Date(2019, 1, 1),`,
                `      max: new Date(2024, 1, 1),`,
                `      color: ['green', 'orange']`,
                `    }`,
                '  ]}',
              ]
            : []),
          ...(colorX === 'piecewise'
            ? [
                '  xAxis={[{',
                `    type: 'piecewise',`,
                `    thresholds: [new Date(2021, 1, 1), new Date(2023, 1, 1)],`,
                `    colors: ['blue', 'red', 'blue'],`,
                '  }]}',
              ]
            : []),

          // ColorY
          ...(colorY === 'None' ? ['  yAxis={[{}]}'] : []),
          ...(colorY === 'continuous'
            ? [
                '  yAxis={[',
                `    {`,
                `      type: 'continuous',`,
                `      min: -10,`,
                `      max: 10,`,
                `      color: ['red', 'green'],`,
                `    }`,
                '  ]}',
              ]
            : []),
          ...(colorY === 'piecewise'
            ? [
                '  yAxis={[{',
                `    type: 'piecewise',`,
                `    thresholds: [0, 10],`,
                `    colors: ['red', 'green', 'blue'],`,

                '  }]}',
              ]
            : []),
          `/>`,
        ].join('\n')}
        language="jsx"
        copyButtonHidden
      />
    </Stack>
  );
}
