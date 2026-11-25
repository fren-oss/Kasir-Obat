export const enterCard = (index = 0) => ({
  initial: { opacity: 0, y: 12, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: {
    duration: 0.32,
    delay: 0.08 + index * 0.04,
    ease: [0.25, 0.46, 0.45, 0.94],
  },
});
