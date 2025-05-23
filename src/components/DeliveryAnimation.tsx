import Lottie from 'lottie-react';

const deliveryAnimation = {
  v: "5.7.1",
  fr: 30,
  ip: 0,
  op: 60,
  w: 800,
  h: 600,
  nm: "Delivery Cyclist",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Background Circle",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [400, 300, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] }
      },
      ao: 0,
      shapes: [
        {
          ty: "el",
          p: { a: 0, k: [0, 0] },
          s: { a: 0, k: [600, 600] },
          c: { a: 0, k: [0.541, 0.169, 0.886] }
        }
      ],
      op: 60
    },
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: "Buildings",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [400, 300, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] }
      },
      ao: 0,
      shapes: [
        {
          ty: "rc",
          d: 1,
          s: { a: 0, k: [80, 200] },
          p: { a: 0, k: [-150, 0] },
          r: { a: 0, k: 0 },
          c: { a: 0, k: [1, 1, 1] }
        },
        {
          ty: "rc",
          d: 1,
          s: { a: 0, k: [80, 150] },
          p: { a: 0, k: [0, 25] },
          r: { a: 0, k: 0 },
          c: { a: 0, k: [1, 1, 1] }
        },
        {
          ty: "rc",
          d: 1,
          s: { a: 0, k: [80, 180] },
          p: { a: 0, k: [150, 10] },
          r: { a: 0, k: 0 },
          c: { a: 0, k: [1, 1, 1] }
        }
      ],
      op: 60
    },
    {
      ddd: 0,
      ind: 3,
      ty: 4,
      nm: "Clouds",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { 
          a: 1,
          k: [
            {
              t: 0,
              s: [400, 200, 0],
              e: [420, 200, 0],
              i: { x: [0.5], y: [0.5] },
              o: { x: [0.5], y: [0.5] }
            },
            {
              t: 30,
              s: [420, 200, 0],
              e: [400, 200, 0],
              i: { x: [0.5], y: [0.5] },
              o: { x: [0.5], y: [0.5] }
            }
          ]
        },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] }
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ty: "el",
              p: { a: 0, k: [0, 0] },
              s: { a: 0, k: [60, 40] },
              c: { a: 0, k: [1, 1, 1] }
            },
            {
              ty: "el",
              p: { a: 0, k: [30, 0] },
              s: { a: 0, k: [40, 30] },
              c: { a: 0, k: [1, 1, 1] }
            },
            {
              ty: "el",
              p: { a: 0, k: [-30, 0] },
              s: { a: 0, k: [40, 30] },
              c: { a: 0, k: [1, 1, 1] }
            }
          ]
        }
      ],
      op: 60
    },
    {
      ddd: 0,
      ind: 4,
      ty: 4,
      nm: "Cyclist",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: {
          a: 1,
          k: [
            {
              t: 0,
              s: [400, 350, 0],
              e: [400, 340, 0],
              i: { x: [0.5], y: [0.5] },
              o: { x: [0.5], y: [0.5] }
            },
            {
              t: 30,
              s: [400, 340, 0],
              e: [400, 350, 0],
              i: { x: [0.5], y: [0.5] },
              o: { x: [0.5], y: [0.5] }
            }
          ]
        },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] }
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ty: "el",
              p: { a: 0, k: [-50, 0] },
              s: { a: 0, k: [80, 80] },
              c: { a: 0, k: [0.22, 1, 0.078] }
            },
            {
              ty: "el",
              p: { a: 0, k: [50, 0] },
              s: { a: 0, k: [80, 80] },
              c: { a: 0, k: [0.22, 1, 0.078] }
            },
            {
              ty: "rc",
              d: 1,
              s: { a: 0, k: [100, 10] },
              p: { a: 0, k: [0, -20] },
              r: { a: 0, k: 45 },
              c: { a: 0, k: [0.22, 1, 0.078] }
            },
            {
              ty: "gr",
              it: [
                {
                  ty: "rc",
                  d: 1,
                  s: { a: 0, k: [40, 60] },
                  p: { a: 0, k: [0, -50] },
                  r: { a: 0, k: 0 },
                  c: { a: 0, k: [0.529, 0.808, 0.922] }
                },
                {
                  ty: "el",
                  p: { a: 0, k: [0, -90] },
                  s: { a: 0, k: [30, 30] },
                  c: { a: 0, k: [0.545, 0.271, 0.075] }
                },
                {
                  ty: "rc",
                  d: 1,
                  s: { a: 0, k: [30, 10] },
                  p: { a: 0, k: [0, -100] },
                  r: { a: 0, k: 0 },
                  c: { a: 0, k: [0.22, 1, 0.078] }
                }
              ]
            }
          ]
        }
      ],
      op: 60
    },
    {
      ddd: 0,
      ind: 5,
      ty: 4,
      nm: "Location Pin",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: {
          a: 1,
          k: [
            {
              t: 0,
              s: [400, 150, 0],
              e: [400, 140, 0],
              i: { x: [0.5], y: [0.5] },
              o: { x: [0.5], y: [0.5] }
            },
            {
              t: 30,
              s: [400, 140, 0],
              e: [400, 150, 0],
              i: { x: [0.5], y: [0.5] },
              o: { x: [0.5], y: [0.5] }
            }
          ]
        },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] }
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ty: "el",
              p: { a: 0, k: [0, 0] },
              s: { a: 0, k: [40, 40] },
              c: { a: 0, k: [1, 0, 0] }
            },
            {
              ty: "tr",
              p: { a: 0, k: [0, -20] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: 45 },
              o: { a: 0, k: 100 }
            }
          ]
        }
      ],
      op: 60
    }
  ]
};

export function DeliveryAnimation() {
  return (
    <div style={{ 
      width: '100%', 
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'absolute',
      top: 0,
      left: 0
    }}>
      <Lottie
        animationData={deliveryAnimation}
        loop={true}
        autoplay={true}
        style={{
          width: '100%',
          height: '100%',
          maxWidth: '800px',
          maxHeight: '600px'
        }}
      />
    </div>
  );
} 