import { useEffect } from 'react';

const BirdAnimation = () => {
  useEffect(() => {
    // Adicionar estilos CSS para animação de pássaros
    const style = document.createElement('style');
    style.textContent = `
      .bird {
        background-image: url('https://s3-us-west-2.amazonaws.com/s.cdpn.io/174479/bird-cells-new.svg');
        filter: invert(20%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(40%) contrast(100%);
        background-size: auto 100%;
        width: 88px;
        height: 125px;
        will-change: background-position;
        animation-name: fly-cycle;
        animation-timing-function: steps(10);
        animation-iteration-count: infinite;
      }

      .bird-one {
        animation-duration: 1s;
        animation-delay: -0.5s;
      }

      .bird-two {
        animation-duration: 0.9s;
        animation-delay: -0.75s;
      }

      .bird-three {
        animation-duration: 1.25s;
        animation-delay: -0.25s;
      }

      .bird-four {
        animation-duration: 1.1s;
        animation-delay: -0.5s;
      }

      .bird-container {
        position: fixed;
        top: 10%;
        left: -3%;
        transform: scale(0) translateX(-10vw);
        will-change: transform;
        animation-name: fly-right-one;
        animation-timing-function: linear;
        animation-iteration-count: infinite;
        z-index: 10;
        pointer-events: none;
      }

      .bird-container-one {
        animation-duration: 15s;
        animation-delay: 0;
      }

      .bird-container-two {
        animation-duration: 16s;
        animation-delay: 1s;
      }

      .bird-container-three {
        animation-duration: 14.6s;
        animation-delay: 9.5s;
      }

      .bird-container-four {
        animation-duration: 16s;
        animation-delay: 10.25s;
      }

      @keyframes fly-cycle {
        100% {
          background-position: -900px 0;
        }
      }

      @keyframes fly-right-one {
        0% {
          transform: scale(0.3) translateX(-10vw);
        }
        10% {
          transform: translateY(2vh) translateX(10vw) scale(0.4);
        }
        20% {
          transform: translateY(0vh) translateX(30vw) scale(0.5);
        }
        30% {
          transform: translateY(4vh) translateX(50vw) scale(0.6);
        }
        40% {
          transform: translateY(2vh) translateX(70vw) scale(0.6);
        }
        50% {
          transform: translateY(0vh) translateX(90vw) scale(0.6);
        }
        60% {
          transform: translateY(0vh) translateX(110vw) scale(0.6);
        }
        100% {
          transform: translateY(0vh) translateX(110vw) scale(0.6);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .bird-container {
          display: none;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <>
      <div className="bird-container bird-container-one">
        <div className="bird bird-one"></div>
      </div>
      <div className="bird-container bird-container-two">
        <div className="bird bird-two"></div>
      </div>
      <div className="bird-container bird-container-three">
        <div className="bird bird-three"></div>
      </div>
      <div className="bird-container bird-container-four">
        <div className="bird bird-four"></div>
      </div>
    </>
  );
};

export default BirdAnimation;



