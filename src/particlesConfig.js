const particlesOptions = {
    particles: {
      number: {
        value: 6,
        density: {
          enable: true,
          value_area: 800
        }
      },
      color: {
        value: "#262939"
      },
      shape: {
        type: "polygon",
        stroke: {
          width: 2,
          color: "#281e1e"
        },
        polygon: {
          nb_sides: 4
        },
        
      },
      opacity: {
        value: 0.31565905665290905,
        random: true,
        anim: {
          enable: false,
          speed: 1.1988011988011988,
          opacity_min: 0.1,
          sync: true
        }
      },
      size: {
        value: 100,
        random: true,
        anim: {
          enable: true,
          speed: 12.181158184520175,
          size_min: 15.429467033725558,
          sync: true
        }
      },
      line_linked: {
        enable: false,
        distance: 80,
        color: "#cdd1e3",
        opacity: 0.7575817359669818,
        width: 2.0844356791251797
      },
      move: {
        enable: true,
        speed: 3,
        direction: "right",
        random: true,
        straight: true,
        out_mode: "out",
        bounce: false,
        attract: {
          enable: true,
          rotateX: 1683.5826639087988,
          rotateY: 1200
        }
      }
    },
    background: {
        color: "#080809", // this sets a background color for the canvas
      },

    fullScreen: {
      enable: true,
      zIndex: -1
    },
    interactivity: {
      detect_on: "window",
      events: {
        onhover: {
          enable: false,
          mode: "grab"
        },
        onclick: {
          enable: false,
          mode: "push"
        },
        resize: true
      },
      modes: {
        grab: {
          distance: 400,
          line_linked: {
            opacity: 1
          }
        },
        bubble: {
          distance: 400,
          size: 40,
          duration: 2,
          opacity: 8,
          speed: 3
        },
        repulse: {
          distance: 200,
          duration: 0.4
        },
        push: {
          particles_nb: 4
        },
        remove: {
          particles_nb: 2
        }
      }
    },
    retina_detect: true
  };
  
  export default particlesOptions;