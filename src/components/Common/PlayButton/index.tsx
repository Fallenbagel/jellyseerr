import React from 'react';
import ButtonWithDropdown from '../ButtonWithDropdown';

interface PlayButtonProps {
  links: PlayButtonLink[];
}

export interface PlayButtonLink {
  text: string;
  url: string;
}

const PlayButton: React.FC<PlayButtonProps> = ({ links }) => {
  if (!links || !links.length) {
    return null;
  }

  return (
    <ButtonWithDropdown
      buttonType="ghost"
      text={
        <>
          <svg
            className="w-5 h-5 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{links[0].text}</span>
        </>
      }
      onClick={() => {
        window.open(links[0].url, '_blank');
      }}
    >
      {links.length > 1 &&
        links.slice(1).map((link, i) => {
          return (
            <ButtonWithDropdown.Item
              key={`play-button-dropdown-item-${i}`}
              onClick={() => {
                window.open(link.url, '_blank');
              }}
              buttonType="ghost"
            >
              {link.text}
            </ButtonWithDropdown.Item>
          );
        })}
    </ButtonWithDropdown>
  );
};

export default PlayButton;
