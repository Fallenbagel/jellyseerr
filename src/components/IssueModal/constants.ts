import { defineMessages, MessageDescriptor } from 'react-intl';
import { IssueType } from '../../../server/constants/issue';

const messages = defineMessages({
  issueAudio: 'Audio',
  issueVideo: 'Video',
  issueSubtitles: 'Subtitle',
  issueOther: 'Other',
});

interface IssueOption {
  name: MessageDescriptor;
  issueType: IssueType;
  mediaType?: 'movie' | 'tv';
}

export const issueOptions: IssueOption[] = [
  {
    name: messages.issueVideo,
    issueType: IssueType.VIDEO,
  },
  {
    name: messages.issueAudio,
    issueType: IssueType.AUDIO,
  },
  {
    name: messages.issueSubtitles,
    issueType: IssueType.SUBTITLES,
  },
  {
    name: messages.issueOther,
    issueType: IssueType.OTHER,
  },
];
