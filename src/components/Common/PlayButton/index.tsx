import Button from '@app/components/Common/Button';
import ButtonWithDropdown from '@app/components/Common/ButtonWithDropdown';

interface PlayButtonProps {
  links: PlayButtonLink[];
  device?: string;
  className?: string;
  movieId?: string | string[];
}

export interface PlayButtonLink {
  text: string;
  url: string;
  svg: React.ReactNode;
}

const PlayButton = ({ links, device, className, movieId }: PlayButtonProps) => {
  if ((!links || !links.length) && !movieId) {
    return null;
  }

  if (device) {
    const handlePlay = async () => {
      await fetch(`/api/v1/movie/${movieId}/play/${device}`, { method: 'GET' });
    };

    return (
      <Button
        className={className ?? className}
        buttonType="ghost"
        onClick={handlePlay}
      >
        {links.length > 1 &&
          links.slice(1).map((link, i) => {
            return (
              <div className="flex" key={`play-button-dropdown-item-${i}`}>
                {links[0].svg}
                <span>Play on {device}</span>
              </div>
            );
          })}
      </Button>
    );
  } else {
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
  }
};

export default PlayButton;
