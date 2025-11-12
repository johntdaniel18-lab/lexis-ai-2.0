import { IeltsTest } from './types';

export const TESTS_VERSION = 3;

export const IELTS_TESTS: IeltsTest[] = [
  {
    id: 1,
    title: "Test 01",
    tags: ["Line Graph", "Tourism", "Discussion (Both Views)", "Sports"],
    tasks: [
      {
        prompt: "The graph below shows the number of enquiries received by the Tourist Information Office in one city over a six-month period in 2011.",
        imageUrl: "https://i.postimg.cc/VvN7CJsg/Test-01-Picture.jpg",
        keyInformation: `
- Enquiries by telephone started at 900 in January.
- Enquiries by telephone rose steadily and finished at 1600 in June.
- Enquiries in person began at approximately 450.
- Enquiries in person rose dramatically to a peak of 1900 in June.
- Enquiries by letter/email started at around 750 and ended the period at 350.
- After February, enquiries by letter/email were always the lowest of the three methods.
- The highest number of enquiries for any method was 1900 (in person, in June).
        `
      },
      {
        prompt: "Some people think that it is more beneficial to take part in sports which are played in teams, like football, while other people think that taking part in individual sports, like tennis or swimming, is better. Discuss both views and give your own opinion."
      }
    ]
  },
  {
    id: 2,
    title: "Test 02",
    tags: ["Table", "Industry", "Employment", "Problem & Solution", "Cities", "Urbanisation"],
    tasks: [
      {
        prompt: "The table shows the number of employees and factories producing silk in England and Wales between 1851 and 1901.",
        imageUrl: "https://i.postimg.cc/8c7wvmsf/Test_2.jpg",
        keyInformation: `
- Number of male employees: 53,964 in 1851, 41,936 in 1861, 38,102 in 1871, 25,766 in 1881, 28,689 in 1891, and 13,375 in 1901.
- Number of female employees: 76,786 in 1851, 67,933 in 1861, 53,310 in 1871, 32,138 in 1881, 30,336 in 1891, and 25,567 in 1901.
- Total employees: 130,750 in 1851, 109,869 in 1861, 91,412 in 1871, 67,904 in 1881, 49,025 in 1891, and 38,942 in 1901.
- Number of factories: 272 in 1851, 761 in 1861, 693 in 1871, 702 in 1881, 663 in 1891, and 623 in 1901.
        `
      },
      {
        prompt: "People living in large cities today face many problems in their everyday life. What are these problems? Should governments encourage people to move to smaller regional towns?"
      }
    ]
  },
  {
    id: 3,
    title: "Test 03",
    tags: ["Process Diagram", "Food Production", "Agree or Disagree", "Technology", "Libraries"],
    tasks: [
      {
        prompt: "The diagram below shows how orange juice is produced.",
        imageUrl: "https://i.postimg.cc/JhRqxLG8/Test_03.jpg",
        keyInformation: `
- Fresh oranges are transported to the factory by a truck.
- The oranges are washed in a machine.
- The juice is extracted from the oranges.
- This extraction process separates fresh juice from solid waste.
- The solid waste is used as animal feed.
- The fresh juice is then packaged.
- The packaged fresh juice is delivered to shops.
- Alternatively, the fresh juice is transported by a refrigerator truck.
- The juice undergoes an evaporation process where water is removed.
- This creates concentrated juice.
- The concentrated juice is put into cans.
- The canned juice is transported to a warehouse.
- From the warehouse, it is taken to another factory.
- At the factory, water is added to the concentrated juice.
- The final product is then packaged.
- The packaged juice is sent to shops for sale.
        `
      },
      {
        prompt: "Maintaining public libraries is a waste of money since computer technology can replace their functions. Do you agree or disagree?"
      }
    ]
  },
  {
    id: 4,
    title: "Test 04",
    tags: ["Bar Chart", "Leisure", "Entertainment", "Advantages & Disadvantages", "Work", "Business"],
    tasks: [
      {
        prompt: "The bar shows the percentage of people going to cinemas in one European country on diﬀerent days.",
        imageUrl: "https://i.postimg.cc/7hzscND4/Test_04.jpg",
        keyInformation: `
- Monday: The values are 10 in 2003, 14 in 2005, and 12 in 2007.
- Tuesday: The values are 20 in 2003, 17 in 2005, and 19 in 2007.
- Wednesday: The values are 16 in 2003, 14 in 2005, and 9 in 2007.
- Thursday: The values are 12 in 2003, 9 in 2005, and 14 in 2007.
- Friday: The values are 30 in 2003, 30 in 2005, and 30 in 2007.
- Saturday: The values are 40 in 2003, 45 in 2005, and 43 in 2007.
- Sunday: The values are 30 in 2003, 34 in 2005, and 32 in 2007.
        `
      },
      {
        prompt: "Research shows that business meetings, discussions and training are happening online nowadays. Do the advantages outweigh the disadvantages?"
      }
    ]
  },
  {
    id: 5,
    title: "Test 05",
    tags: ["Bar Chart", "Health", "Lifestyle", "Agree or Disagree", "Science", "Government"],
    tasks: [
      {
        prompt: "The bar shows the percentage of people going to cinemas in one European country on diﬀerent days.",
        imageUrl: "https://i.postimg.cc/vTnqjvMs/Test_05.jpg",
        keyInformation: `
- Age group 0-9: The value for females is 51.4 and for males is 50.3.
- Age group 10-17: The value for females is 42.2 and for males is 24.6.
- Age group 18-39: The value for females is 17.1 and for males is 9.7.
- Age group 40-59: The value for females is 12.3 and for males is 8.0.
- Age group 60+: The value for females is 18.5 and for males is 13.2.
        `
      },
      {
        prompt: "Scientific research should be carried out and controlled by governments rather than private companies. Do you agree or disagree?"
      }
    ]
  },
  {
    id: 6,
    title: "Test 06",
    tags: ["Bar Chart", "Health", "Diet", "Two-Part Question", "Work", "Employment", "Education"],
    tasks: [
      {
        prompt: "The chart below shows the percentage of the population in the UK who consumed the recommended daily amount of fruit and vegetables in 2002, 2006 and 2010.",
        imageUrl: "https://i.postimg.cc/RFkGcntw/Test_06.jpg",
        keyInformation: `
- Year 2002: The percentage for men is 22%, for women is 25%, and for children is 11%.
- Year 2006: The percentage for men is 28%, for women is 32%, and for children is 16%.
- Year 2010: The percentage for men is 24%, for women is 27%, and for children is 14%.
        `
      },
      {
        prompt: "Nowadays, some employers think that formal academic qualifications are more important than life experience or personal qualities when they look for new employees. Why is it the case? Is it a positive or negative development?"
      }
    ]
  },
  {
    id: 7,
    title: "Test 07",
    tags: ["Bar Chart", "Work", "Salary", "Discussion (Both Views)", "Housing", "Architecture"],
    tasks: [
      {
        prompt: "The chart below shows the annual pay (thousands of US dollars) for doctors and other workers in seven countries in 2004.",
        imageUrl: "https://i.postimg.cc/bwygHPGq/Test_07.jpg",
        keyInformation: `
- France: The value for Doctors is approximately 70 and for Other workers is approximately 30.
- Italy: The value for Doctors is approximately 60 and for Other workers is approximately 20.
- Czech: The value for Doctors is approximately 65 and for Other workers is approximately 20.
- Germany: The value for Doctors is approximately 65 and for Other workers is approximately 20.
- Finland: The value for Doctors is approximately 50 and for Other workers is approximately 25.
- Switzerland: The value for Doctors is approximately 70 and for Other workers is approximately 40.
- The US: The value for Doctors is approximately 120 and for Other workers is approximately 45.
        `
      },
      {
        prompt: "Some people think that newly built houses should follow the style of old houses in local areas. Others think that people should have freedom to build houses of their own style. Discuss both these views and give your own opinion."
      }
    ]
  },
  {
    id: 8,
    title: "Test 08",
    tags: ["Table", "Finance", "International Aid", "Agree or Disagree", "Architecture", "Design"],
    tasks: [
      {
        prompt: "The table shows the amount of money given to developing countries by the USA, EU countries and other countries from 2006 to 2010 (Figures are in millions of dollars).",
        imageUrl: "https://i.postimg.cc/rFcNMTNc/Test_08.jpg",
        keyInformation: `
- USA: 9.8 in 2006, 11 in 2007, 17 in 2008, 16.7 in 2009, and 20.3 in 2010.
- EU: 3.1 in 2006, 3.4 in 2007, 3.9 in 2008, 3.6 in 2009, and 4.1 in 2010.
- Other countries: 2.8 in 2006, 3.2 in 2007, 3.5 in 2008, 3.2 in 2009, and 3.7 in 2010.
- Total: 15.7 in 2006, 17.6 in 2007, 24.4 in 2008, 23.5 in 2009, and 28.1 in 2010.
        `
      },
      {
        prompt: "When designing a building, the most important factor is the intended use of the building rather than its outward appearance. To what extent do you agree or disagree?"
      }
    ]
  },
  {
    id: 9,
    title: "Test 09",
    tags: ["Pie Charts", "Employment", "Society", "Agree or Disagree", "Culture", "Museums"],
    tasks: [
      {
        prompt: "The charts below show the percentage of people aged 23-65 in diﬀerent occupations in one UK town (Ashby) and in the UK as a whole in 2008.",
        imageUrl: "https://i.postimg.cc/Qt1cZYBP/Test_09.jpg",
        keyInformation: `
- Employment sectors in Ashby: Unemployed 14, Construction work 16, Shop work 14, Professional work 8, Technical work 9, Personal service 21, and Office work 18.
- Employment sectors in The UK: Unemployed 10, Construction work 10, Shop work 13, Professional work 14, Technical work 17, Personal service 17, and Office work 19.
        `
      },
      {
        prompt: "Museums and art galleries should concentrate on works that show the history and culture of their own country rather than works of the other parts of the world. To what extent do you agree or disagree?"
      }
    ]
  },
  {
    id: 10,
    title: "Test 10",
    tags: ["Line Graph", "Technology", "Finance", "Discussion (Both Views)", "Arts", "Culture", "Government Funding"],
    tasks: [
      {
        prompt: "The chart below shows the average cost of monthly contract for four diﬀerent mobile (cell phones) in a European country from January to September 2002, measured in euro.",
        imageUrl: "https://i.postimg.cc/tC2WbxT0/Test_10.jpg",
        keyInformation: `
- Domo: Approximately 15 in Jan, 16 in Feb, 17.5 in Mar, 16 in Apr, 20 in May, 20 in Jun, 25 in Jul, 24 in Aug, and 23 in Sep.
- Lex: Approximately 12 in Jan, 10 in Feb, 13 in Mar, 13 in Apr, 14 in May, 13 in Jun, 16 in Jul, 16 in Aug, and 18.5 in Sep.
- Sim TX: Approximately 9 in Jan, 8 in Feb, 9 in Mar, 11 in Apr, 11 in May, 14 in Jun, 10 in Jul, 9 in Aug, and 8 in Sep.
- Alpha: 5 in Jan, 5 in Feb, approximately 6 in Mar, 7 in Apr, 6 in May, 5 in Jun, 10 in Jul, 13 in Aug, and 25 in Sep.
        `
      },
      {
        prompt: "Some people think the government funding should not be used for supporting art and culture, while others think supporting cultural activities may be beneficial for the population and the culture. Discuss both these views and give your own opinion."
      }
    ]
  }
];