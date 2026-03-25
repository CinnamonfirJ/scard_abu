import Transition from "react-native-screen-transitions";
import { interpolate } from "react-native-reanimated";

// Default spring configuration for general screen transitions
export const defaultTransitionSpec = {
  open: { stiffness: 1000, damping: 500, mass: 3 },
  close: { stiffness: 1000, damping: 500, mass: 3 },
};

// Sheet-specific spring config for a bouncy but controlled feel
export const sheetTransitionSpec = {
  open: { stiffness: 500, damping: 45, mass: 1 },
  close: { stiffness: 500, damping: 45, mass: 1 },
  expand: { stiffness: 400, damping: 35 },
  collapse: { stiffness: 400, damping: 35 },
};

// Standard Screen Transition (Slide from right, iOS style)
export const standardTransition = {
  gestureEnabled: true,
  gestureDirection: "horizontal" as const,
  transitionSpec: defaultTransitionSpec,
  screenStyleInterpolator: ({ progress, layouts: { screen } }: any) => {
    "worklet";
    return {
      contentStyle: {
        transform: [
          {
            translateX: interpolate(
              progress,
              [0, 1, 2],
              [screen.width, 0, -screen.width * 0.3]
            ),
          },
        ],
      },
    };
  },
};

// Modal Transition (Slide from bottom)
export const modalTransition = {
  ...Transition.Presets.SlideFromBottom(),
  gestureEnabled: true,
  gestureDirection: "vertical" as const,
  gestureActivationArea: "screen" as const,
  transitionSpec: defaultTransitionSpec,
};

// Bottom Sheet Config
export const bottomSheetTransition = {
  ...Transition.Presets.SlideFromBottom(),
  gestureEnabled: true,
  gestureDirection: "vertical" as const,
  gestureActivationArea: "screen" as const,
  snapPoints: [0.6, 1],
  initialSnapIndex: 0,
  backdropBehavior: "dismiss" as const,
  transitionSpec: sheetTransitionSpec,
  // Ensure the screen container itself is transparent
  screenStyleInterpolator: (props: any) => {
    "worklet";
    const { progress, layouts: { screen } } = props;
    const translateY = interpolate(progress, [0, 1, 2], [screen.height, 0, -screen.height]);
    return {
      contentStyle: {
        transform: [{ translateY }],
        backgroundColor: "transparent", // Critical for seeing through to bottom nav
      },
      backdropStyle: {
        opacity: interpolate(progress, [0, 1], [0, 0.5]),
        backgroundColor: "black",
      },
    };
  },
};

// Tab Switch Transition (Slide from right)
export const tabTransition = {
  gestureEnabled: true,
  gestureDirection: "horizontal" as const,
  transitionSpec: defaultTransitionSpec,
  screenStyleInterpolator: ({ progress, layouts: { screen } }: any) => {
    "worklet";
    return {
      contentStyle: {
        transform: [
          {
            translateX: interpolate(
              progress,
              [0, 1, 2],
              [screen.width, 0, -screen.width]
            ),
          },
        ],
      },
    };
  },
};

// Custom Animation Examples (e.g. Scale and Fade for Confirmation)
export const scaleFadeTransition = {
  gestureEnabled: true,
  transitionSpec: defaultTransitionSpec,
  screenStyleInterpolator: ({ progress }: any) => {
    "worklet";
    return {
      contentStyle: {
        opacity: interpolate(progress, [0, 1, 2], [0, 1, 0]),
        transform: [
          { scale: interpolate(progress, [0, 1, 2], [0.9, 1, 1.1]) },
        ],
      },
      backdropStyle: {
        opacity: interpolate(progress, [0, 1, 2], [0, 0.5, 0]),
        backgroundColor: "black",
      },
    };
  },
};
