import React, { useState } from 'react';
import { Share2, Copy, Check, Twitter, Linkedin, Facebook, Mail, MessageSquare } from 'lucide-react';
import { URLSharing, useAnalytics } from '../utils/analytics';

interface ShareButtonProps {
  title: string;
  description?: string;
  contentType: string;
  shareData?: {
    view?: string;
    filters?: any;
    story?: string;
    chapter?: string | number;
    customConfig?: any;
  };
  className?: string;
  compact?: boolean;
}

export const ShareButton: React.FC<ShareButtonProps> = ({
  title,
  description,
  contentType,
  shareData = {},
  className = '',
  compact = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const { trackShare } = useAnalytics();

  const shareUrl = URLSharing.generateShareableURL(shareData);
  const socialUrls = URLSharing.generateSocialShareURLs(shareUrl, title, description);

  const handleCopyLink = async () => {
    const success = await URLSharing.copyToClipboard(shareUrl);
    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleSocialShare = (platform: string, url: string) => {
    window.open(url, '_blank', 'width=600,height=400');
    trackShare(contentType, platform, shareUrl);
    setIsOpen(false);
  };

  const shareOptions = [
    {
      id: 'copy',
      label: 'Copy Link',
      icon: copySuccess ? Check : Copy,
      action: handleCopyLink,
      className: copySuccess ? 'text-green-600' : 'text-gray-600'
    },
    {
      id: 'twitter',
      label: 'Twitter',
      icon: Twitter,
      action: () => handleSocialShare('twitter', socialUrls.twitter),
      className: 'text-blue-400'
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      icon: Linkedin,
      action: () => handleSocialShare('linkedin', socialUrls.linkedin),
      className: 'text-blue-700'
    },
    {
      id: 'facebook',
      label: 'Facebook',
      icon: Facebook,
      action: () => handleSocialShare('facebook', socialUrls.facebook),
      className: 'text-blue-600'
    },
    {
      id: 'email',
      label: 'Email',
      icon: Mail,
      action: () => {
        window.location.href = socialUrls.email;
        trackShare(contentType, 'email', shareUrl);
        setIsOpen(false);
      },
      className: 'text-gray-600'
    },
    {
      id: 'reddit',
      label: 'Reddit',
      icon: MessageSquare,
      action: () => handleSocialShare('reddit', socialUrls.reddit),
      className: 'text-orange-600'
    }
  ];

  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`p-2 text-gray-500 hover:text-gray-700 transition-colors ${className}`}
          title="Share"
          aria-label="Share this content"
        >
          <Share2 className="w-4 h-4" />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <div className="p-2">
              <div className="text-xs font-medium text-gray-900 mb-2 px-2">{title}</div>
              <div className="space-y-1">
                {shareOptions.map(option => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.id}
                      onClick={option.action}
                      className="w-full flex items-center px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors"
                    >
                      <Icon className={`w-4 h-4 mr-2 ${option.className}`} />
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Backdrop */}
        {isOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors ${className}`}
      >
        <Share2 className="w-4 h-4 mr-2" />
        Share
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">{title}</h3>
            
            {description && (
              <p className="text-xs text-gray-600 mb-4">{description}</p>
            )}

            <div className="space-y-2">
              {/* Copy Link */}
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  {copySuccess ? (
                    <Check className="w-4 h-4 mr-3 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 mr-3 text-gray-600" />
                  )}
                  <span className="text-sm font-medium text-gray-900">
                    {copySuccess ? 'Copied!' : 'Copy Link'}
                  </span>
                </div>
              </button>

              {/* Social Media Options */}
              <div className="grid grid-cols-2 gap-2">
                {shareOptions.slice(1).map(option => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.id}
                      onClick={option.action}
                      className="flex items-center justify-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Icon className={`w-4 h-4 mr-2 ${option.className}`} />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* URL Preview */}
            <div className="mt-4 p-2 bg-gray-50 rounded text-xs text-gray-600 break-all">
              {shareUrl}
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default ShareButton;