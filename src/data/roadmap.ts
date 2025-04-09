interface RoadmapItem {
  title: string;
  description: string;
}

interface RoadmapCategory {
  title: string;
  items: RoadmapItem[];
  status: 'completed' | 'in-progress' | 'planned';
}

export const roadmapData: RoadmapCategory[] = [
  {
    title: 'Completed',
    status: 'completed',
    items: [
      {
        title: 'Core Parser Engine',
        description: 'Foundation for efficient parsing'
      },
      {
        title: 'Basic Documentation',
        description: 'Essential guides and tutorials'
      }
    ]
  },
  {
    title: 'In Progress',
    status: 'in-progress',
    items: [
      {
        title: 'Language Support',
        description: 'Expanding supported languages'
      },
      {
        title: 'Performance Optimization',
        description: 'Enhancing parsing speed'
      }
    ]
  },
  {
    title: 'Planned',
    status: 'planned',
    items: [
      {
        title: 'IDE Integration',
        description: 'Plugin support for major IDEs'
      },
      {
        title: 'Advanced Features',
        description: 'Error recovery and debugging tools'
      }
    ]
  }
]; 