import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { useEffect } from "react";

const teacherCommittee = [
  {
    name: "Prof. Sharana T.M. Zaheer",
    role: "EESA Faculty Head",
    image: "/placeholder.svg?height=100&width=100",
    initials: "STZ",
  },
  {
    name: "Prof. T.F. More",
    role: "Head of Electrical Engineering Department",
    image: "/placeholder.svg?height=100&width=100",
    initials: "TFM",
  },
];

const studentCommittee = [
  {
    name: "Mr. Pranay Ingale",
    role: "President",
    image: "/placeholder.svg?height=100&width=100",
    initials: "PI",
  },
  {
    name: "Mr. Aman Gadekar",
    role: "Vice-President",
    image: "/placeholder.svg?height=100&width=100",
    initials: "AG",
  },
  {
    name: "Mr. Nikhil Dhawale",
    role: "Treasurer",
    image: "/placeholder.svg?height=100&width=100",
    initials: "ND",
  },
  {
    name: "Mr. Sujit Dhore",
    role: "Secretary",
    image: "/placeholder.svg?height=100&width=100",
    initials: "SD",
  },
  {
    name: "Miss Sharayu Tichkule",
    role: "Ladies Representative",
    image: "/placeholder.svg?height=100&width=100",
    initials: "ST",
  },
  {
    name: "Miss Shanjivini Shetye",
    role: "Ladies Representative",
    image: "/placeholder.svg?height=100&width=100",
    initials: "SS",
  },
];


const MotionCard = motion(Card);

function CommitteeMember({ member, index }) {
  return (
    <MotionCard
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl bg-white border border-blue-100"
    >
      <CardHeader className="pb-0">
        <div className="flex justify-center">
          <Avatar className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 border-4 border-blue-500 shadow-lg">
            <AvatarImage src={member.image} alt={member.name} />
            <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl font-bold">
              {member.initials}
            </AvatarFallback>
          </Avatar>
        </div>
      </CardHeader>
      <CardContent className="text-center pt-4">
        <h3 className="text-xl font-semibold text-gray-800 mb-1">
          {member.name}
        </h3>
        <p className="text-md font-medium text-blue-600">{member.role}</p>
      </CardContent>
    </MotionCard>
  );
}

function CommitteeSection({ title, members }) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="mt-16 px-4"
    >
      <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-10 text-center">
        {title}
      </h2>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {members.map((member, index) => (
          <CommitteeMember key={index} member={member} index={index} />
        ))}
      </div>
    </motion.section>
  );
}

export default function ElectricalCommittee() {
  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to the top
  }, []);
  return (
    <div className="min-h-screen mt-20 bg-white">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="bg-cover bg-center h-[60vh] flex items-center justify-center relative"
        style={{
          backgroundImage:
            "url('electricalTeacherCommittee.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-black opacity-60"></div>
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8">
          <motion.h1
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-4"
          >
            Electrical Department Committee
          </motion.h1>
          <motion.p
            initial={{ y: 50 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-4 text-xl sm:text-2xl text-blue-100 max-w-3xl mx-auto"
          >
            Meet the dedicated team behind our Electrical Engineering
            department
          </motion.p>
        </div>
      </motion.div>
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mt-16 px-4"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-6 text-center">
            EESA Committee
          </h2>
          <Card className="bg-white border border-blue-100 p-6 shadow-xl">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">
              About EESA
            </h3>
            <p className="text-gray-600 mb-4">
              The Electrical Engineering Students' Association (EESA) is the
              organizing committee of the Electrical Engineering department.
              EESA plays a crucial role in promoting academic excellence and
              extracurricular engagement for electrical engineering students.
            </p>
            <h4 className="text-xl font-semibold text-gray-800 mb-2">
              Key Responsibilities:
            </h4>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Hosting industrial visits and technical workshops</li>
              <li>Organizing academic competitions and exhibitions</li>
              <li>Facilitating student-industry networking opportunities</li>
              <li>Encouraging research in electrical engineering</li>
              <li>Managing department-level events and projects</li>
            </ul>
          </Card>
        </motion.section>
        <CommitteeSection title="Faculty Members" members={teacherCommittee} />
        <CommitteeSection
          title="EESA Committee Members"
          members={studentCommittee}
        />
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mt-16 px-4"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-6 text-center">
            Innovate Club
          </h2>
          <Card className="bg-white border border-blue-100 p-6 shadow-xl">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">
              About Innovate Club
            </h3>
            <p className="text-gray-600 mb-4">
              The Innovate Club is a student-driven initiative under the
              Electrical Engineering department. It inspires creativity and
              technical innovation, empowering students to design and develop
              cutting-edge solutions.
            </p>
            <h4 className="text-xl font-semibold text-gray-800 mb-2">
              Key Responsibilities:
            </h4>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Conducting hands-on technical workshops</li>
              <li>Encouraging collaborative projects and research</li>
              <li>Organizing hackathons and innovation challenges</li>
              <li>Facilitating guest lectures and tech talks</li>
              <li>Promoting participation in national-level competitions</li>
            </ul>
          </Card>
        </motion.section>
      </div>
    </div>
  );
}
