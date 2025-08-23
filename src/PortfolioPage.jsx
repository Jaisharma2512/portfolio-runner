import React, { useRef, useEffect, useState } from 'react';
import RunnerGame from './RunnerGame';

const linkStyle = {
  color: '#4cd9ff',
  textDecoration: 'underline',
  cursor: 'pointer',
  transition: 'color 0.3s ease',
};

const sectionTitleStyle = {
  borderBottom: '2px solid #4cd9ff',
  paddingBottom: 6,
  marginBottom: 20,
  fontSize: '1.8rem',
  fontWeight: '700',
  color: '#49c4ff',
};

const paragraphStyle = {
  whiteSpace: 'pre-wrap',
  lineHeight: 1.6,
  fontSize: 16,
  marginBottom: 24,
};

const listStyle = {
  lineHeight: 1.8,
  marginTop: 6,
  marginBottom: 24,
  paddingLeft: 20,
};

const skillTileStyle = {
  display: 'inline-block',
  backgroundColor: '#223344',
  color: '#4cd9ff',
  padding: '8px 14px',
  margin: '6px 8px 6px 0',
  borderRadius: 20,
  fontWeight: '600',
  cursor: 'default',
  userSelect: 'none',
  boxShadow: '0 0 6px rgba(76, 217, 255, 0.3)',
  transition: 'background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease',
};

const skillTileHoverStyle = {
  backgroundColor: '#4cd9ff',
  color: '#121212',
  transform: 'translateY(-3px)',
  boxShadow: '0 6px 14px rgba(76, 217, 255, 0.6)',
};

function SkillTile({ skill }) {
  const [hovered, setHovered] = useState(false);

  return (
    <span
      style={{ ...skillTileStyle, ...(hovered ? skillTileHoverStyle : {}) }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {skill}
    </span>
  );
};

// Intersection observer hook to trigger fade-in & slide animations on scroll
function useScrollFadeIn() {
  const domRef = useRef();
  const [isVisible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (domRef.current) observer.observe(domRef.current);
    return () => observer.disconnect();
  }, []);

  return [domRef, isVisible];
}

function FadeInSection({ id, title, content }) {
  const [ref, visible] = useScrollFadeIn();

  return (
    <section
      id={id}
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
        marginBottom: 60,
      }}
    >
      <h2 style={sectionTitleStyle}>{title}</h2>
      {typeof content === 'string' ? (
        <p style={paragraphStyle}>{content}</p>
      ) : (
        content
      )}
    </section>
  );
}

const sections = [
  {
    id: 'summary',
    title: 'Professional Summary',
    content:
      'Experienced DevOps Engineer with a track record of delivering efficient infrastructure automation and scalable CI/CD solutions. Skilled in cloud technologies and committed to driving innovation in secure and reliable system design.',
  },
  {
    id: 'work-experience',
    title: 'Professional Experience',
    content: (
      <>
        <p>
          <strong>Zscaler</strong><br />
          Cloud Support Engineer – DevOps | Chandigarh, India<br />
          March 2023 – March 2025<br />
          (Internship: Mar 2023 – Oct 2023 | Full-time: Oct 2023 – Mar 2025)
        </p>
        <ul style={listStyle}>
          <li>Led deployment of Google Cloud Platform lab environments using Kubernetes and Terraform focused on Source IP Anchoring and Browser Isolation in Zero Trust Security contexts.</li>
          <li>Enhanced deployment reliability by integrating validation scripts, successfully reducing manual errors.</li>
          <li>Automated provisioning workflows with Terraform and CI/CD pipelines, elevating deployment accuracy by 97%.</li>
          <li>Contributed to disaster recovery solutions using containerized architectures.</li>
          <li>Provided key support in troubleshooting and training for cloud security operations.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'education',
    title: 'Education',
    content: (
      <>
        Graphic Era Deemed to be University – July 2023<br />
        Bachelor of Technology in Computer Science Engineering<br />
        CGPA: 8.04 / 10<br />
        <em>Recipient of IEEE UP section Certificate of Appreciation</em>
      </>
    ),
  },
  {
    id: 'skills',
    title: 'Technical Skills',
    content: (
      <div>
        {[
          'Google Cloud Platform',
          'Terraform',
          'Jenkins',
          'Kubernetes',
          'Docker',
          'Ansible',
          'Argo CD',
          'Git',
          'GitHub',
          'Bash',
          'Python',
          'PowerShell',
          'Prometheus',
          'NGINX',
          'Linux',
          'Windows Server',
          'MySQL',
          'CI/CD',
          'Helm',
          'Cloud Networking',
          'Zero Trust Security',
          'GitOps',
        ].map((skill) => (
          <SkillTile key={skill} skill={skill} />
        ))}
      </div>
    ),
  },
  {
    id: 'projects',
    title: 'Key Projects',
    content: (
      <>
        <div>
          <strong>Security Playground</strong>{' '}
          <a href="https://sc.danklofan.com" target="_blank" rel="noopener noreferrer" style={linkStyle}>
            [Live Demo]
          </a>{' '}
          <a href="https://github.com/Jaisharma2512/security-playground" target="_blank" rel="noopener noreferrer" style={linkStyle}>
            [GitHub]
          </a>
          <ul style={listStyle}>
            <li>Developed a containerized web server simulating security vulnerabilities to facilitate hands-on learning in Dockerized environments.</li>
            <li>Orchestrated deployment on GKE with Jenkins pipelines and configured NGINX reverse proxies for realistic sandbox testing of security issues.</li>
          </ul>
        </div>
        <div>
          <strong>Small Boy</strong>{' '}
          <a href="https://smallboy.danklofan.com" target="_blank" rel="noopener noreferrer" style={linkStyle}>
            [Live Demo]
          </a>{' '}
          |{' '}
          <a href="https://github.com/Jaisharma2512/Smallboy/tree/k8s-resources" target="_blank" rel="noopener noreferrer" style={linkStyle}>
            [GitHub]
          </a>
          <ul style={listStyle}>
            <li>Automated GKE provisioning using Terraform for a URL shortener application, boosting infrastructure deployment efficiency by 80%.</li>
            <li>Architected CI/CD pipelines leveraging Jenkins and GitHub Actions, using Helm charts and ArgoCD for seamless containerized deployments with zero downtime.</li>
          </ul>
        </div>
      </>
    ),
  },
  {
    id: 'certificates',
    title: 'Certifications',
    content: (
      <>
        <p>
          <a href="https://www.credly.com/badges/cc43f249-f710-4c80-b8f1-2aee8011d07f/public_url" target="_blank" rel="noopener noreferrer" style={linkStyle}>
            Google Associate Cloud Engineer
          </a>
        </p>
        <p>
          <a href="https://drive.google.com/file/d/1C24ksyNmTdIhgfdjhaLbmhy0RD326OR-/view?usp=sharing" target="_blank" rel="noopener noreferrer" style={linkStyle}>
            IEEE Certificate of Appreciation
          </a>
        </p>
      </>
    ),
  },
];

export default function PortfolioPage() {
  return (
    <div
      style={{
        backgroundColor: '#121212',
        color: '#4cd9ff',
        fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
        minHeight: '150vh',
        padding: 20,
      }}
    >
      <section style={{ maxWidth: 1200, margin: '0 auto 60px auto' }}>
        <RunnerGame />
      </section>

      <main style={{ maxWidth: 900, margin: '0 auto' }}>
        {sections.map(({ id, title, content }) => (
          <FadeInSection key={id} id={id} title={title} content={content} />
        ))}
      </main>
    </div>
  );
}
