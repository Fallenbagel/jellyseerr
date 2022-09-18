import ButtonWithDropdown from '@app/components/Common/ButtonWithDropdown';

interface PlayButtonProps {
  links: PlayButtonLink[];
}

export interface PlayButtonLink {
  text: string;
  url: string;
  svg: React.ReactNode;
}

const PlayButton = ({ links }: PlayButtonProps) => {
  if (!links || !links.length) {
    return null;
  }

  return (
    <ButtonWithDropdown
      buttonType="ghost"
      text={
        <>
          {links[0].svg}
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
              {link.svg}
              <span>{link.text}</span>
            </ButtonWithDropdown.Item>
          );
        })}
    </ButtonWithDropdown>
  );
};

export default PlayButton;
