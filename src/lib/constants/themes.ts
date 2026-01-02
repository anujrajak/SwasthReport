export type Theme = "default" | "blue" | "green" | "orange" | "red" | "rose" | "violet" | "yellow";

export interface ThemeConfig {
  name: string;
  colors: {
    light: {
      primary: string;
      primaryForeground: string;
      ring: string;
      chart1: string;
      chart2: string;
      chart3: string;
      chart4: string;
      chart5: string;
      sidebarPrimary: string;
      iconActive: string;
      iconInactive: string;
    };
    dark: {
      primary: string;
      primaryForeground: string;
      ring: string;
      chart1: string;
      chart2: string;
      chart3: string;
      chart4: string;
      chart5: string;
      sidebarPrimary: string;
      iconActive: string;
      iconInactive: string;
    };
  };
}

export const themes: Record<Theme, ThemeConfig> = {
  default: {
    name: "Default",
    colors: {
      light: {
        primary: "oklch(0.541 0.281 293.009)",
        primaryForeground: "oklch(0.969 0.016 293.756)",
        ring: "oklch(0.702 0.183 293.541)",
        chart1: "oklch(0.811 0.111 293.571)",
        chart2: "oklch(0.606 0.25 292.717)",
        chart3: "oklch(0.541 0.281 293.009)",
        chart4: "oklch(0.491 0.27 292.581)",
        chart5: "oklch(0.432 0.232 292.759)",
        sidebarPrimary: "oklch(0.541 0.281 293.009)",
        iconActive: "oklch(0.541 0.281 293.009)",
        iconInactive: "oklch(0.552 0.016 285.938)",
      },
      dark: {
        primary: "oklch(0.606 0.25 292.717)",
        primaryForeground: "oklch(0.969 0.016 293.756)",
        ring: "oklch(0.38 0.189 293.745)",
        chart1: "oklch(0.811 0.111 293.571)",
        chart2: "oklch(0.606 0.25 292.717)",
        chart3: "oklch(0.541 0.281 293.009)",
        chart4: "oklch(0.491 0.27 292.581)",
        chart5: "oklch(0.432 0.232 292.759)",
        sidebarPrimary: "oklch(0.606 0.25 292.717)",
        iconActive: "oklch(0.606 0.25 292.717)",
        iconInactive: "oklch(0.705 0.015 286.067)",
      },
    },
  },
  blue: {
    name: "Blue",
    colors: {
      light: {
        primary: "oklch(0.514 0.19 251.813)",
        primaryForeground: "oklch(0.985 0 0)",
        ring: "oklch(0.514 0.19 251.813)",
        chart1: "oklch(0.646 0.222 237.32)",
        chart2: "oklch(0.6 0.118 252.37)",
        chart3: "oklch(0.398 0.07 264.36)",
        chart4: "oklch(0.828 0.189 237.32)",
        chart5: "oklch(0.756 0.15 252.37)",
        sidebarPrimary: "oklch(0.514 0.19 251.813)",
        iconActive: "oklch(0.514 0.19 251.813)",
        iconInactive: "oklch(0.552 0.016 285.938)",
      },
      dark: {
        primary: "oklch(0.598 0.195 251.813)",
        primaryForeground: "oklch(0.141 0.005 285.823)",
        ring: "oklch(0.598 0.195 251.813)",
        chart1: "oklch(0.646 0.222 237.32)",
        chart2: "oklch(0.6 0.118 252.37)",
        chart3: "oklch(0.398 0.07 264.36)",
        chart4: "oklch(0.828 0.189 237.32)",
        chart5: "oklch(0.756 0.15 252.37)",
        sidebarPrimary: "oklch(0.598 0.195 251.813)",
        iconActive: "oklch(0.598 0.195 251.813)",
        iconInactive: "oklch(0.705 0.015 286.067)",
      },
    },
  },
  green: {
    name: "Green",
    colors: {
      light: {
        primary: "oklch(0.523 0.194 142.5)",
        primaryForeground: "oklch(0.985 0 0)",
        ring: "oklch(0.523 0.194 142.5)",
        chart1: "oklch(0.745 0.15 142.5)",
        chart2: "oklch(0.551 0.218 142.5)",
        chart3: "oklch(0.396 0.07 142.5)",
        chart4: "oklch(0.828 0.189 142.5)",
        chart5: "oklch(0.756 0.15 142.5)",
        sidebarPrimary: "oklch(0.523 0.194 142.5)",
        iconActive: "oklch(0.523 0.194 142.5)",
        iconInactive: "oklch(0.552 0.016 285.938)",
      },
      dark: {
        primary: "oklch(0.604 0.199 142.5)",
        primaryForeground: "oklch(0.141 0.005 285.823)",
        ring: "oklch(0.604 0.199 142.5)",
        chart1: "oklch(0.745 0.15 142.5)",
        chart2: "oklch(0.551 0.218 142.5)",
        chart3: "oklch(0.396 0.07 142.5)",
        chart4: "oklch(0.828 0.189 142.5)",
        chart5: "oklch(0.756 0.15 142.5)",
        sidebarPrimary: "oklch(0.604 0.199 142.5)",
        iconActive: "oklch(0.604 0.199 142.5)",
        iconInactive: "oklch(0.705 0.015 286.067)",
      },
    },
  },
  orange: {
    name: "Orange",
    colors: {
      light: {
        primary: "oklch(0.7 0.15 70)",
        primaryForeground: "oklch(0.141 0.005 285.823)",
        ring: "oklch(0.7 0.15 70)",
        chart1: "oklch(0.8 0.15 70)",
        chart2: "oklch(0.65 0.15 70)",
        chart3: "oklch(0.55 0.15 70)",
        chart4: "oklch(0.75 0.15 70)",
        chart5: "oklch(0.6 0.15 70)",
        sidebarPrimary: "oklch(0.7 0.15 70)",
        iconActive: "oklch(0.7 0.15 70)",
        iconInactive: "oklch(0.552 0.016 285.938)",
      },
      dark: {
        primary: "oklch(0.75 0.15 70)",
        primaryForeground: "oklch(0.141 0.005 285.823)",
        ring: "oklch(0.75 0.15 70)",
        chart1: "oklch(0.8 0.15 70)",
        chart2: "oklch(0.65 0.15 70)",
        chart3: "oklch(0.55 0.15 70)",
        chart4: "oklch(0.75 0.15 70)",
        chart5: "oklch(0.6 0.15 70)",
        sidebarPrimary: "oklch(0.75 0.15 70)",
        iconActive: "oklch(0.75 0.15 70)",
        iconInactive: "oklch(0.705 0.015 286.067)",
      },
    },
  },
  red: {
    name: "Red",
    colors: {
      light: {
        primary: "oklch(0.577 0.245 27.325)",
        primaryForeground: "oklch(0.985 0 0)",
        ring: "oklch(0.577 0.245 27.325)",
        chart1: "oklch(0.704 0.191 22.216)",
        chart2: "oklch(0.646 0.222 22.216)",
        chart3: "oklch(0.577 0.245 27.325)",
        chart4: "oklch(0.828 0.189 22.216)",
        chart5: "oklch(0.756 0.15 22.216)",
        sidebarPrimary: "oklch(0.577 0.245 27.325)",
        iconActive: "oklch(0.577 0.245 27.325)",
        iconInactive: "oklch(0.552 0.016 285.938)",
      },
      dark: {
        primary: "oklch(0.704 0.191 22.216)",
        primaryForeground: "oklch(0.141 0.005 285.823)",
        ring: "oklch(0.704 0.191 22.216)",
        chart1: "oklch(0.704 0.191 22.216)",
        chart2: "oklch(0.646 0.222 22.216)",
        chart3: "oklch(0.577 0.245 27.325)",
        chart4: "oklch(0.828 0.189 22.216)",
        chart5: "oklch(0.756 0.15 22.216)",
        sidebarPrimary: "oklch(0.704 0.191 22.216)",
        iconActive: "oklch(0.704 0.191 22.216)",
        iconInactive: "oklch(0.705 0.015 286.067)",
      },
    },
  },
  rose: {
    name: "Rose",
    colors: {
      light: {
        primary: "oklch(0.577 0.245 27.325)",
        primaryForeground: "oklch(0.985 0 0)",
        ring: "oklch(0.577 0.245 27.325)",
        chart1: "oklch(0.704 0.191 22.216)",
        chart2: "oklch(0.646 0.222 22.216)",
        chart3: "oklch(0.577 0.245 27.325)",
        chart4: "oklch(0.828 0.189 22.216)",
        chart5: "oklch(0.756 0.15 22.216)",
        sidebarPrimary: "oklch(0.577 0.245 27.325)",
        iconActive: "oklch(0.577 0.245 27.325)",
        iconInactive: "oklch(0.552 0.016 285.938)",
      },
      dark: {
        primary: "oklch(0.704 0.191 22.216)",
        primaryForeground: "oklch(0.141 0.005 285.823)",
        ring: "oklch(0.704 0.191 22.216)",
        chart1: "oklch(0.704 0.191 22.216)",
        chart2: "oklch(0.646 0.222 22.216)",
        chart3: "oklch(0.577 0.245 27.325)",
        chart4: "oklch(0.828 0.189 22.216)",
        chart5: "oklch(0.756 0.15 22.216)",
        sidebarPrimary: "oklch(0.704 0.191 22.216)",
        iconActive: "oklch(0.704 0.191 22.216)",
        iconInactive: "oklch(0.705 0.015 286.067)",
      },
    },
  },
  violet: {
    name: "Violet",
    colors: {
      light: {
        primary: "oklch(0.514 0.19 280)",
        primaryForeground: "oklch(0.985 0 0)",
        ring: "oklch(0.514 0.19 280)",
        chart1: "oklch(0.646 0.222 280)",
        chart2: "oklch(0.6 0.118 280)",
        chart3: "oklch(0.398 0.07 280)",
        chart4: "oklch(0.828 0.189 280)",
        chart5: "oklch(0.756 0.15 280)",
        sidebarPrimary: "oklch(0.514 0.19 280)",
        iconActive: "oklch(0.514 0.19 280)",
        iconInactive: "oklch(0.552 0.016 285.938)",
      },
      dark: {
        primary: "oklch(0.598 0.195 280)",
        primaryForeground: "oklch(0.141 0.005 285.823)",
        ring: "oklch(0.598 0.195 280)",
        chart1: "oklch(0.646 0.222 280)",
        chart2: "oklch(0.6 0.118 280)",
        chart3: "oklch(0.398 0.07 280)",
        chart4: "oklch(0.828 0.189 280)",
        chart5: "oklch(0.756 0.15 280)",
        sidebarPrimary: "oklch(0.598 0.195 280)",
        iconActive: "oklch(0.598 0.195 280)",
        iconInactive: "oklch(0.705 0.015 286.067)",
      },
    },
  },
  yellow: {
    name: "Yellow",
    colors: {
      light: {
        primary: "oklch(0.769 0.188 70.08)",
        primaryForeground: "oklch(0.141 0.005 285.823)",
        ring: "oklch(0.769 0.188 70.08)",
        chart1: "oklch(0.769 0.188 70.08)",
        chart2: "oklch(0.696 0.17 162.48)",
        chart3: "oklch(0.627 0.265 303.9)",
        chart4: "oklch(0.645 0.246 16.439)",
        chart5: "oklch(0.488 0.243 264.376)",
        sidebarPrimary: "oklch(0.769 0.188 70.08)",
        iconActive: "oklch(0.769 0.188 70.08)",
        iconInactive: "oklch(0.552 0.016 285.938)",
      },
      dark: {
        primary: "oklch(0.769 0.188 70.08)",
        primaryForeground: "oklch(0.141 0.005 285.823)",
        ring: "oklch(0.769 0.188 70.08)",
        chart1: "oklch(0.769 0.188 70.08)",
        chart2: "oklch(0.696 0.17 162.48)",
        chart3: "oklch(0.627 0.265 303.9)",
        chart4: "oklch(0.645 0.246 16.439)",
        chart5: "oklch(0.488 0.243 264.376)",
        sidebarPrimary: "oklch(0.769 0.188 70.08)",
        iconActive: "oklch(0.769 0.188 70.08)",
        iconInactive: "oklch(0.705 0.015 286.067)",
      },
    },
  },
};

export const themeNames: Theme[] = ["default", "blue", "green", "orange", "red", "rose", "violet", "yellow"];

