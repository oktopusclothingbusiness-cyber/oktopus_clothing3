import {
  Bell,
  User,
  MapPin,
  Mail,
  Linkedin,
  Twitter,
  Instagram,
  FileText,
  Figma,
  Briefcase,
  GraduationCap,
  Sparkles,
  Eye,
  Diamond,
  LayoutGrid,
} from 'lucide-react';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { profileData, experiences } from '@/lib/data';

const SectionTitle = ({
  icon: Icon,
  title,
}: {
  icon: React.ElementType;
  title: string;
}) => (
  <div className="flex items-center gap-2 mb-4">
    <Icon className="w-6 h-6 text-primary" />
    <h2 className="text-xl font-bold font-headline">{title}</h2>
  </div>
);

const SkillPill = ({
  icon: Icon,
  label,
  color,
}: {
  icon: React.ElementType;
  label: string;
  color?: string;
}) => (
  <Badge
    variant="default"
    className={`flex items-center gap-2 p-2 rounded-lg text-sm font-medium ${color}`}
  >
    <Icon className="w-5 h-5" />
    <span>{label}</span>
  </Badge>
);

const BehanceIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7.93005 10.36H12.18"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    ></path>
    <path
      d="M7.93005 14.02H11.02"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    ></path>
    <path
      d="M15.42 14.04C16.9659 14.04 18.21 12.7959 18.21 11.25C18.21 9.70413 16.9659 8.46001 15.42 8.46001C13.8741 8.46001 12.63 9.70413 12.63 11.25C12.63 12.7959 13.8741 14.04 15.42 14.04Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    ></path>
    <path
      d="M22 11.25C22 17.11 17.11 22 11.25 22C5.39 22 2.15 17.11 2.15 11.25C2.15 5.39 5.39 2 11.25 2C17.11 2 22 5.39 22 11.25Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    ></path>
  </svg>
);


export default function Home() {
  const education = experiences.filter((exp) => exp.type === 'Education');
  const organization = experiences.filter((exp) => exp.type === 'Work');

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex justify-between items-center text-sm text-muted-foreground">
          <p>May 4th, 2006</p>
          <p>Visual/Graphic Designer</p>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="space-y-8 lg:col-span-1">
            <Card className="p-6 bg-white/80 dark:bg-black/50 backdrop-blur-sm rounded-3xl shadow-lg">
              <CardHeader className="flex flex-row items-center gap-4 p-0 mb-4">
                <div className="bg-yellow-400 p-3 rounded-full">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold font-headline">About User</h3>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-sm text-muted-foreground">
                  A graphic designer hailing from Indonesia with ±4 years of
                  experience in the field. My talents encompass crafting
                  editorial designs, creating visuals for live streaming and
                  social media, expertly editing visual content, and analyzing
                  social media insights.
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 grid-rows-3 gap-4">
              <SkillPill
                icon={Sparkles}
                label="Critical Thinking"
                color="bg-red-200 dark:bg-red-800/50 text-red-800 dark:text-red-200"
              />
              <SkillPill
                icon={FileText}
                label="Attention to Detail"
                color="bg-gray-200 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200"
              />
              <SkillPill
                icon={Eye}
                label="Visual Aesthetic"
                color="bg-gray-700 dark:bg-gray-800 text-white dark:text-gray-200"
              />
              <SkillPill
                icon={Diamond}
                label="Creativity"
                color="bg-purple-200 dark:bg-purple-800/50 text-purple-800 dark:text-purple-200"
              />
              <SkillPill
                icon={LayoutGrid}
                label="Organized"
                color="bg-gray-200 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200"
              />
            </div>
          </div>

          {/* Center Column - Profile */}
          <div className="lg:col-span-2 relative flex flex-col sm:flex-row items-center justify-center gap-8">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-[20rem] font-bold text-gray-200 dark:text-gray-700 -mt-16">
                C
              </div>
            </div>
            <div className="relative w-64 h-80 sm:w-72 sm:h-96 flex-shrink-0">
              <Image
                src={profileData.imageUrl}
                alt={profileData.name}
                fill
                className="rounded-t-full object-cover"
                data-ai-hint="profile photo"
              />
            </div>
            <div className="relative text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 text-muted-foreground">
                <User className="w-5 h-5" />
                <span>Visual/Graphic Designer</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold font-headline mt-2">
                {profileData.name}
              </h1>
              <p className="text-muted-foreground mt-1">
                <MapPin className="inline w-4 h-4 mr-1" />
                Pasuruan, Indonesia
              </p>
              <Card className="mt-4 p-4 bg-white/80 dark:bg-black/50 backdrop-blur-sm rounded-3xl shadow-lg w-32 h-32 inline-flex flex-col items-center justify-center">
                <p className="text-xs text-muted-foreground -mt-2">/years old</p>
                <div className="relative mt-2">
                  <div className="text-6xl font-bold text-primary">17</div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg
                      viewBox="0 0 36 36"
                      className="w-24 h-24"
                      style={{ transform: 'rotate(-90deg)' }}
                    >
                      <path
                        className="text-gray-200 dark:text-gray-700"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-primary"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray="80, 100"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Education & Organization */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <SectionTitle icon={GraduationCap} title="Education" />
            <div className="space-y-4">
              {education.map((item) => (
                <div key={item.role} className="flex gap-4">
                  <p className="text-sm text-muted-foreground w-20 flex-shrink-0">
                    {item.date}
                  </p>
                  <div>
                    <h4 className="font-semibold">{item.role}</h4>
                    <p className="text-sm text-muted-foreground">
                      {item.company}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <SectionTitle icon={Briefcase} title="Organization" />
            <div className="space-y-4">
              {organization.map((item) => (
                <div key={item.role} className="flex gap-4">
                  <p className="text-sm text-muted-foreground w-20 flex-shrink-0">
                    {item.date}
                  </p>
                  <div>
                    <h4 className="font-semibold">{item.role}</h4>
                    <p className="text-sm text-muted-foreground">
                      {item.company}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Software Skills */}
        <div>
          <SectionTitle icon={Figma} title="Software Skills" />
          <div className="flex flex-wrap gap-4">
            {profileData.softwareSkills.map((skill) => (
              <div
                key={skill}
                className="w-16 h-16 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center shadow"
              >
                <span className="text-2xl font-bold">{skill}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div>
          <SectionTitle icon={Mail} title="Contact" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-4 bg-white/80 dark:bg-black/50 backdrop-blur-sm rounded-2xl shadow-lg flex items-center gap-3">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-medium">
                zidnalfalah@progresiftv.id
              </span>
            </Card>

            <Card className="p-4 bg-white/80 dark:bg-black/50 backdrop-blur-sm rounded-2xl shadow-lg">
              <div className="flex items-center gap-3">
                <Instagram className="w-6 h-6" />
                <span className="font-bold">@zidnalfalah_</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <Button className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-6 py-1 h-auto">
                  Follow
                </Button>
                <span className="text-sm font-bold text-muted-foreground">
                  1.2K
                </span>
              </div>
            </Card>

             <Card className="p-4 bg-white/80 dark:bg-black/50 backdrop-blur-sm rounded-2xl shadow-lg flex items-center gap-3">
              <Linkedin className="w-6 h-6 text-blue-700" />
              <div>
                 <p className="font-bold">{profileData.name}</p>
                 <p className="text-xs text-muted-foreground">linkedin.com/in/zidnalfalah</p>
              </div>
            </Card>
            
            <Card className="p-4 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-2xl shadow-lg row-span-2 flex flex-col justify-between">
               <div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-white"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12.18.23a12 12 0 0 0-8.94 20.35l.1.16c.33.52.6.93.78 1.25.2.35.4.67.63.95.14.18.3.35.48.5a1.14 1.14 0 0 0 1.83-.75v-4.5a3.84 3.84 0 0 1 1.2-2.73 4.67 4.67 0 0 0 3.1-4.22c0-2.8-1.7-5.3-4.19-5.3Z" />
                  </svg>
                  <p className="mt-4 font-bold text-lg">Check My Other Project on Pinterest</p>
               </div>
               <Button asChild className="bg-white/30 hover:bg-white/40 text-white rounded-lg w-full">
                  <Link href="#">s.id/jidsportfolio</Link>
               </Button>
            </Card>

            <Card className="p-4 bg-white/80 dark:bg-black/50 backdrop-blur-sm rounded-2xl shadow-lg flex items-center gap-3">
              <Twitter className="w-5 h-5" />
              <span className="font-bold">@zidnalfalah_</span>
            </Card>
            
            <Card className="p-4 bg-white/80 dark:bg-black/50 backdrop-blur-sm rounded-2xl shadow-lg flex items-center gap-3">
              <BehanceIcon className="w-6 h-6" />
              <div>
                 <p className="font-bold">{profileData.name}</p>
                 <p className="text-xs text-muted-foreground">www.behance.net/zidnalfalah</p>
              </div>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}
