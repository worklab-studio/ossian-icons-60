import React from 'react';
import { Helmet } from 'react-helmet-async';
import { IconstackLogo } from '@/components/iconstack-logo';
import { Separator } from '@/components/ui/separator';

const LicensePage = () => {
  const iconLibraries = [
    'Material Design Icons',
    'Ant Design Icons', 
    'Line Icons',
    'Pixelart Icons',
    'Teeny Icons',
    'Tabler Icons',
    'Lucide Icons',
    'Feather Icons',
    'Phosphor Icons',
    'Remix Icons',
    'Bootstrap Icons',
    'BoxIcons',
    'CSS.gg',
    'Iconsax',
    'Fluent UI Icons',
    'IconNoir',
    'Ikonate',
    'Octicons',
    'Radix Icons',
    'Solar Icons'
  ];

  return (
    <>
      <Helmet>
        <title>License | Iconstack - Open Source Icon Libraries</title>
        <meta 
          name="description" 
          content="IconStack aggregates 50,000+ free icons from leading open-source libraries, all licensed under MIT License for personal and commercial use." 
        />
        <meta 
          name="keywords" 
          content="icon license, MIT license, free icons, open source icons, commercial use icons, icon copyright" 
        />
        <link rel="canonical" href="https://iconstack.io/license" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header Section */}
        <div className="border-b">
          <div className="max-w-4xl mx-auto px-6 py-16">
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-primary/10 border border-primary/20">
                <IconstackLogo className="text-primary w-8 h-8" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-center text-foreground animate-fade-in">
              License
            </h1>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-6 py-16 space-y-16">
          
          {/* License Overview */}
          <section className="animate-fade-in">
            <div className="space-y-6 text-lg leading-relaxed text-foreground">
              <p>
                Iconstack is an open-source icon aggregation platform that combines over 50,000+ free icons from leading open-source libraries.
              </p>
              <p>
                All included icons are distributed under the MIT License, which permits both personal and commercial use.
              </p>
              <p>
                Iconstack does not claim ownership of any icon sets. Credit belongs to the original authors and maintainers of each library. Iconstack simply provides a unified interface to search, preview, and export them.
              </p>
            </div>
          </section>

          <Separator />

          {/* MIT License Summary */}
          <section className="animate-fade-in">
            <h2 className="text-2xl font-bold text-foreground mb-8">
              MIT License (Summary)
            </h2>
            <div className="space-y-6">
              <p className="text-lg text-foreground">
                The MIT License is a permissive open-source license that allows:
              </p>
              
              <div className="border-l-2 border-primary/20 pl-6 space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-3 flex-shrink-0"></div>
                  <p className="text-foreground">Use of the icons in personal and commercial projects</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-3 flex-shrink-0"></div>
                  <p className="text-foreground">Modification, remixing, or customization</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-3 flex-shrink-0"></div>
                  <p className="text-foreground">Distribution as part of your own work</p>
                </div>
              </div>

              <div className="border-l-2 border-border pl-6 space-y-4 mt-8">
                <h3 className="font-semibold text-foreground">Conditions:</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-3 flex-shrink-0"></div>
                    <p className="text-foreground">The original copyright and license notice must be included in any copy or substantial portion of the icons.</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-3 flex-shrink-0"></div>
                    <p className="text-foreground">The icons are provided "as is," without warranty of any kind.</p>
                  </div>
                </div>
              </div>

              <p className="text-foreground mt-6">
                For the full license text, refer to the{' '}
                <a 
                  href="https://opensource.org/licenses/MIT" 
                  className="text-primary hover:underline font-medium"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  MIT License
                </a>.
              </p>
            </div>
          </section>

          <Separator />

          {/* Libraries Included */}
          <section className="animate-fade-in">
            <h2 className="text-2xl font-bold text-foreground mb-8">
              Libraries Included in Iconstack
            </h2>
            <p className="text-lg text-foreground mb-8">
              The following libraries are aggregated in Iconstack, each licensed under the MIT License:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              {iconLibraries.map((library, index) => (
                <div key={library} className="border-b border-border last:border-b-0 md:odd:border-r md:border-r-border">
                  <div className="p-4 hover:bg-hover-bg transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></div>
                      <span className="text-foreground font-medium">{library}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <Separator />

          {/* Usage Disclaimer */}
          <section className="animate-fade-in">
            <h2 className="text-2xl font-bold text-foreground mb-8">
              Usage Disclaimer
            </h2>
            <div className="space-y-6 text-foreground">
              <div className="border-l-2 border-border pl-6 space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-3 flex-shrink-0"></div>
                  <p>All icons remain the property of their respective authors.</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-3 flex-shrink-0"></div>
                  <p>Iconstack does not modify the terms of the MIT License.</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-3 flex-shrink-0"></div>
                  <p>Users are responsible for ensuring proper attribution where required and for including the license text in redistributed or commercial works.</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-3 flex-shrink-0"></div>
                  <p>Iconstack is provided as a convenience layer and makes no warranties regarding the icons' suitability for any specific purpose.</p>
                </div>
              </div>
              
              <div className="border-l-2 border-primary/20 pl-6 mt-8">
                <p className="text-foreground">
                  If you are an author of one of the listed libraries and believe attribution is missing or inaccurate, please contact us at{' '}
                  <a 
                    href="mailto:hello@thedeepflux.com" 
                    className="text-primary hover:underline font-medium"
                  >
                    hello@thedeepflux.com
                  </a>
                  {' '}for correction.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default LicensePage;