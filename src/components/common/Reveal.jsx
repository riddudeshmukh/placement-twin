import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { fadeUp, staggerContainer, viewportOnce } from '../../lib/motion';

/**
 * Reveals its children on scroll-into-view with a fade+rise.
 * Pass `stagger` to also stagger direct motion children (use with <RevealItem>).
 */
export function Reveal({ as = 'div', className, stagger, delay = 0, children, ...rest }) {
  const reduced=useReducedMotion();
  const Comp = motion[as] || motion.div;
  const variants = reduced ? {hidden:{opacity:1},show:{opacity:1}} : stagger ? staggerContainer(stagger, delay) : {hidden:{opacity:0,y:22,filter:"blur(4px)"},show:{opacity:1,y:0,filter:"blur(0px)",transition:{duration:.55}}};
  return (
    <Comp
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      {...rest}
    >
      {children}
    </Comp>
  );
}

export function RevealItem({ as = 'div', className, children, ...rest }) {
  const Comp = motion[as] || motion.div;
  return (
    <Comp className={className} variants={fadeUp} {...rest}>
      {children}
    </Comp>
  );
}

export default Reveal;
