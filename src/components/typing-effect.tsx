"use client";

import { useState, useEffect } from 'react';
import { generateTypingEffect } from '@/actions/generate-typing-effect.action';

const TYPING_SPEED = 100;
const DELETING_SPEED = 50;
const DELAY_BETWEEN_ROLES = 2000;

const TypingEffect = ({ roles }: { roles: string[] }) => {
  const [displayedRoles, setDisplayedRoles] = useState<string[]>([]);
  const [roleIndex, setRoleIndex] = useState(0);
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    const fetchRoles = async () => {
      const selectedRoles = await generateTypingEffect(roles);
      setDisplayedRoles(selectedRoles);
    };
    fetchRoles();
  }, [roles]);

  useEffect(() => {
    if (displayedRoles.length === 0) return;

    const handleTyping = () => {
      const currentRole = displayedRoles[roleIndex];
      if (isDeleting) {
        setText(currentRole.substring(0, text.length - 1));
      } else {
        setText(currentRole.substring(0, text.length + 1));
      }

      if (!isDeleting && text === currentRole) {
        setTimeout(() => setIsDeleting(true), DELAY_BETWEEN_ROLES);
      } else if (isDeleting && text === '') {
        setIsDeleting(false);
        setRoleIndex((prevIndex) => (prevIndex + 1) % displayedRoles.length);
      }
    };

    const timeout = setTimeout(handleTyping, isDeleting ? DELETING_SPEED : TYPING_SPEED);
    return () => clearTimeout(timeout);
  }, [text, isDeleting, roleIndex, displayedRoles]);

  return (
    <span className="font-headline text-2xl font-semibold text-primary sm:text-3xl md:text-4xl">
      {text}
      <span className="animate-ping">|</span>
    </span>
  );
};

export default TypingEffect;
