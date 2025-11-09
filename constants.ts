import { IeltsTest } from './types';

export const TESTS_VERSION = 2;

export const IELTS_TESTS: IeltsTest[] = [
  {
    id: 1,
    title: "Practice Test 1: Tourism & Sports",
    tasks: [
      {
        prompt: "The graph below shows the number of enquiries received by the Tourist Information Office in one city over a six-month period in 2011.",
        imageUrl: "https://i.postimg.cc/VvN7CJsg/Test-01-Picture.jpg"
      },
      {
        prompt: "Some people think that it is more beneficial to take part in sports which are played in teams, like football, while other people think that taking part in individual sports, like tennis or swimming, is better. Discuss both views and give your own opinion."
      }
    ]
  },
  {
    id: 2,
    title: "Practice Test 2: Environment & Urbanization",
    tasks: [
      {
        prompt: "The diagram below shows the process of recycling plastic bottles. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. You should write at least 150 words."
      },
      {
        prompt: "The continuous growth of cities is putting a strain on the environment. What are the main problems associated with urbanization, and what solutions can you suggest? Give reasons for your answer and include any relevant examples from your own knowledge or experience. You should write at least 250 words."
      }
    ]
  },
  {
    id: 3,
    title: "Practice Test 3: Health & Lifestyle",
    tasks: [
      {
        prompt: "The table below gives information about the consumption and production of potatoes in five different regions in 2006. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. You should write at least 150 words."
      },
      {
        prompt: "Some people say that the best way to improve public health is by increasing the number of sports facilities. Others, however, say that this would have little effect and that other measures are required. Discuss both these views and give your own opinion. You should write at least 250 words."
      }
    ]
  }
];
