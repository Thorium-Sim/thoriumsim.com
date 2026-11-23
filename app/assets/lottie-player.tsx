import lottie from "lottie-web";
import { clientEntry, ref, type Handle, type MixInput } from "remix/component";

interface LottieProps {
  animationData: any;
}
export const LottiePlayer = clientEntry(import.meta.url, (handle: Handle<LottieProps>) => {
  return () => (
    <div
      mix={ref((node, signal) => {
        // @ts-expect-error
        lottie.loadAnimation({
          container: node,
          animationData: handle.props.animationData,
          autoplay: true,
          loop: true,
        });
        signal.addEventListener("abort", () => {
          // @ts-expect-error
          lottie.destroy();
        });
      })}
    />
  );
});
