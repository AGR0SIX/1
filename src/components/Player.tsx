import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Position, PlayerStyle } from '../types';

interface PlayerProps {
  position: Position;
  style: PlayerStyle;
  onDragStart: (event: React.MouseEvent) => void;
  isDragging: boolean;
  onNumberChange: (number: number) => void;
  onRoleChange: (role: string) => void;
  onDotNameChange?: (dotName: string) => void;
  isNew?: boolean;
  isRemoving?: boolean;
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
  fieldRotation?: number;
  fieldVerticalRotation?: number;
}

const Player: React.FC<PlayerProps> = ({ 
  position, 
  style, 
  onDragStart, 
  isDragging, 
  onNumberChange,
  onRoleChange,
  onDotNameChange,
  isNew = false,
  isRemoving = false,
  showLabel = true,
  size = 'medium',
  fieldRotation = 0,
  fieldVerticalRotation = 0
}) => {
  const [isEditingNumber, setIsEditingNumber] = useState(false);
  const [isEditingRole, setIsEditingRole] = useState(false);
  const [isEditingDotName, setIsEditingDotName] = useState(false);
  const [tempNumber, setTempNumber] = useState(position.number.toString());
  const [tempRole, setTempRole] = useState(position.role);
  const [tempDotName, setTempDotName] = useState(position.dotName || '');
  const [isVisible, setIsVisible] = useState(!isNew);

  const sizeClasses = {
    small: {
      container: 'h-8 w-8',
      number: 'text-sm',
      label: '-bottom-4 text-[10px]',
      dotName: '-bottom-7 text-[8px]',
      inputWidth: 'w-5'
    },
    medium: {
      container: 'h-10 w-10',
      number: 'text-base',
      label: '-bottom-5 text-xs',
      dotName: '-bottom-8 text-[10px]',
      inputWidth: 'w-6'
    },
    large: {
      container: 'h-12 w-12',
      number: 'text-lg',
      label: '-bottom-6 text-sm',
      dotName: '-bottom-10 text-xs',
      inputWidth: 'w-8'
    }
  };

  const isGoalkeeper = position.role === 'GK';
  const playerColors = isGoalkeeper ? {
    primary: '#00ff00',
    secondary: '#39ff14',
    glow: '#00ff00'
  } : {
    primary: style.primaryColor,
    secondary: style.secondaryColor,
    glow: style.primaryColor
  };

  useEffect(() => {
    if (isNew) {
      requestAnimationFrame(() => setIsVisible(true));
    }
  }, [isNew]);

  useEffect(() => {
    setTempNumber(position.number.toString());
    setTempRole(position.role);
    setTempDotName(position.dotName || '');
  }, [position.number, position.role, position.dotName]);

  const handleNumberDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditingNumber(true);
  };

  const handleRoleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditingRole(true);
  };

  const handleDotNameDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditingDotName(true);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d{1,2}$/.test(value)) {
      setTempNumber(value);
    }
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempRole(e.target.value.slice(0, 4).toUpperCase());
  };

  const handleDotNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempDotName(e.target.value.slice(0, 20));
  };

  const handleNumberBlur = () => {
    const newNumber = parseInt(tempNumber);
    if (!isNaN(newNumber) && newNumber >= 0 && newNumber <= 99) {
      onNumberChange(newNumber);
    } else {
      setTempNumber(position.number.toString());
    }
    setIsEditingNumber(false);
  };

  const handleRoleBlur = () => {
    if (tempRole.trim()) {
      onRoleChange(tempRole.trim());
    } else {
      setTempRole(position.role);
    }
    setIsEditingRole(false);
  };

  const handleDotNameBlur = () => {
    if (onDotNameChange) {
      onDotNameChange(tempDotName.trim());
    }
    setIsEditingDotName(false);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent,
    type: 'number' | 'role' | 'dotName',
    currentValue: string,
    resetValue: string,
    blurHandler: () => void
  ) => {
    if (e.key === 'Enter') {
      blurHandler();
    } else if (e.key === 'Escape') {
      if (type === 'number') {
        setTempNumber(resetValue);
        setIsEditingNumber(false);
      } else if (type === 'role') {
        setTempRole(resetValue);
        setIsEditingRole(false);
      } else {
        setTempDotName(resetValue);
        setIsEditingDotName(false);
      }
    }
  };

  const springTransition = {
    type: "spring",
    damping: 35,
    stiffness: 400,
    mass: 1,
    restDelta: 0.001,
    restSpeed: 0.001
  };

  const tweenTransition = {
    type: "tween",
    duration: 0.15,
    ease: "easeOut"
  };

  // Counter-rotation style to keep text readable
  const counterRotationStyle = {
    transform: `rotateX(${-fieldVerticalRotation}deg) rotateZ(${-fieldRotation}deg)`,
    transformStyle: 'preserve-3d'
  };

  return (
    <motion.div
      className={`player-element absolute flex select-none ${sizeClasses[size].container}`}
      style={{
        position: 'absolute',
        left: `${position.x}%`,
        top: `${position.y}%`,
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: isDragging ? 50 : (isEditingNumber || isEditingRole || isEditingDotName ? 51 : 1),
        transform: 'translate(-50%, -50%)'
      }}
      initial={isNew ? { scale: 0.5, opacity: 0 } : false}
      animate={{
        scale: isDragging ? 1.05 : 1,
        opacity: isVisible ? 1 : 0
      }}
      exit={isRemoving ? { scale: 0.5, opacity: 0 } : undefined}
      transition={springTransition}
      onMouseDown={!isEditingNumber ? onDragStart : undefined}
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={handleNumberDoubleClick}
    >
      <motion.div 
        className="absolute inset-0 rounded-full blur-sm"
        initial={false}
        animate={{
          opacity: isDragging ? 0.15 : 0.1,
          scale: isDragging ? 1.1 : 1
        }}
        transition={tweenTransition}
        style={{ 
          backgroundColor: playerColors.glow,
          opacity: isGoalkeeper ? '0.15' : '0.1'
        }}
      />
      
      <motion.div 
        className="relative flex h-full w-full items-center justify-center rounded-full shadow-sm"
        initial={false}
        animate={{
          scale: isDragging ? 1.05 : 1,
          boxShadow: isDragging 
            ? '0 0 10px rgba(0,0,0,0.2)' 
            : '0 0 6px rgba(0,0,0,0.15)'
        }}
        whileHover={{ 
          scale: isDragging ? 1.05 : 1.02,
          transition: tweenTransition
        }}
        transition={tweenTransition}
        style={{
          background: `linear-gradient(135deg, ${playerColors.primary}, ${playerColors.secondary})`,
          boxShadow: isGoalkeeper ? '0 0 10px rgba(0, 255, 0, 0.2)' : undefined,
          ...counterRotationStyle
        }}
      >
        {isEditingNumber ? (
          <input
            type="text"
            value={tempNumber}
            onChange={handleNumberChange}
            onBlur={handleNumberBlur}
            onKeyDown={(e) => handleKeyDown(e, 'number', tempNumber, position.number.toString(), handleNumberBlur)}
            className={`${sizeClasses[size].inputWidth} bg-transparent text-center ${sizeClasses[size].number} font-bold focus:outline-none`}
            style={{ color: style.numberColor }}
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <motion.span 
            className={`player-number ${sizeClasses[size].number} font-bold`}
            style={{ color: style.numberColor }} 
            animate={{ opacity: 1 }}
            transition={tweenTransition}
          >
            {position.number}
          </motion.span>
        )}
      </motion.div>
      
      {showLabel && (
        <>
          <motion.div 
            className={`absolute left-1/2 font-medium ${sizeClasses[size].label}`}
            initial={false}
            animate={{
              opacity: isDragging ? 0 : 1,
              x: '-50%',
              scale: isDragging ? 0.95 : 1
            }}
            transition={tweenTransition}
            style={{ 
              color: isGoalkeeper ? '#00ff00' : style.labelColor,
              textShadow: isGoalkeeper ? '0 0 6px rgba(0, 255, 0, 0.3)' : undefined,
              transform: 'translateX(-50%)',
              ...counterRotationStyle
            }}
            onDoubleClick={handleRoleDoubleClick}
          >
            {isEditingRole ? (
              <input
                type="text"
                value={tempRole}
                onChange={handleRoleChange}
                onBlur={handleRoleBlur}
                onKeyDown={(e) => handleKeyDown(e, 'role', tempRole, position.role, handleRoleBlur)}
                className="w-12 bg-[#252525] text-center rounded px-1 focus:outline-none"
                style={{ color: isGoalkeeper ? '#00ff00' : style.labelColor }}
                autoFocus
                maxLength={4}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <motion.span
                animate={{ opacity: 1 }}
                transition={tweenTransition}
              >
                {position.role}
              </motion.span>
            )}
          </motion.div>

          {(isEditingDotName || position.dotName) && (
            <motion.div 
              className={`absolute left-1/2 font-medium ${sizeClasses[size].dotName}`}
              initial={false}
              animate={{
                opacity: isDragging ? 0 : 1,
                x: '-50%',
                scale: isDragging ? 0.95 : 1
              }}
              transition={tweenTransition}
              style={{ 
                color: isGoalkeeper ? '#00ff00' : style.labelColor,
                textShadow: isGoalkeeper ? '0 0 6px rgba(0, 255, 0, 0.3)' : undefined,
                transform: 'translateX(-50%)',
                ...counterRotationStyle
              }}
              onDoubleClick={handleDotNameDoubleClick}
            >
              {isEditingDotName ? (
                <input
                  type="text"
                  value={tempDotName}
                  onChange={handleDotNameChange}
                  onBlur={handleDotNameBlur}
                  onKeyDown={(e) => handleKeyDown(e, 'dotName', tempDotName, position.dotName || '', handleDotNameBlur)}
                  className="w-24 bg-[#252525] text-center rounded px-1 focus:outline-none"
                  style={{ color: isGoalkeeper ? '#00ff00' : style.labelColor }}
                  autoFocus
                  placeholder="Enter name"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <motion.span
                  animate={{ opacity: 1 }}
                  transition={tweenTransition}
                  className="opacity-75"
                >
                  {position.dotName}
                </motion.span>
              )}
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}

export default Player;