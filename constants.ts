import { IeltsTest } from './types';

export const TESTS_VERSION = 6;

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
        imageUrl: "https://i.postimg.cc/rFcNc7d3/Test-08.jpg",
        keyInformation: `
- USA: 22,789 in 2006, 23,261 in 2007, 26,456 in 2008, 28,843 in 2009, 30,461 in 2010.
- EU Countries: 38,712 in 2006, 45,613 in 2007, 54,631 in 2008, 59,214 in 2009, 58,817 in 2010.
- Other Countries: 18,521 in 2006, 22,354 in 2007, 25,621 in 2008, 30,214 in 2009, 31,524 in 2010.
- Total: 80,022 in 2006, 91,228 in 2007, 106,708 in 2008, 118,271 in 2009, 120,802 in 2010.
`
      },
      {
        prompt: "Nowadays many old buildings are protected by the law. Some people think these old buildings should be knocked down to make way for new ones. Do you agree or disagree?"
      }
    ]
  },
  {
    id: 9,
    title: "Test 09",
    tags: ["Pie Charts", "Employment", "Society", "Agree or Disagree", "Culture", "Museums"],
    tasks: [
      {
        prompt: "The pie charts show the proportion of a country's workforce employed in three sectors in 1950 and 2010.",
        imageUrl: "https://i.postimg.cc/pT3Ff0fW/Test_09.jpg",
        keyInformation: `
- 1950: Services 45%, Agriculture 40%, Industry 15%.
- 2010: Services 75%, Industry 15%, Agriculture 10%.
`
      },
      {
        prompt: "Some people think that museums should be enjoyable places to attract and entertain young people, while others think the purpose of museums is to educate, not entertain. Discuss both views and give your own opinion."
      }
    ]
  },
  {
    id: 10,
    title: "Test 10",
    tags: ["Line Graph", "Technology", "Finance", "Discussion (Both Views)", "Arts", "Culture", "Government Funding"],
    tasks: [
      {
        prompt: "The line graph shows the percentage of people in a European country who used the Internet between 1999 and 2009.",
        imageUrl: "https://i.postimg.cc/J0vJ6rRz/Test-10.jpg",
        keyInformation: `
- 1999: Approximately 10%
- 2001: Rises to 30%
- 2003: Increases to 50%
- 2005: Rises again to 70%
- 2007: Increases to 80%
- 2009: Peaks at approximately 85%
`
      },
      {
        prompt: "Some people believe that the government should spend more money on arts and culture, while others think this funding could be better used for public services like healthcare and education. Discuss both views and give your own opinion."
      }
    ]
  },
  {
    id: 11,
    title: "Test 11",
    tags: ["Bar Chart", "Population", "Age Groups", "Japan", "Positive or Negative"],
    tasks: [
      {
        prompt: "The chart below shows Japan's population by age groups starting in 1960 and including a forecast to 2040.",
        imageUrl: "https://i.postimg.cc/9FGD9TZ7/japan_s_population_by_age_groups_1960_2040.png",
        keyInformation: "Chart title: Japan's Population by Age Groups (1960-2040)\nCategories (X-Axis): 1960, 1970, 1980, 1990, 2000, 2010, 2020, 2030, 2040\nX Axis Label: Year\nY Axis Label: Population (%)\nData series:\n1 0-14, values: 30, 35, 28, 29, 20, 18, 15, 12, 10\n2 25-64, values: 65, 70, 68, 70, 68, 65, 60, 55, 57\n3 65+, values: 5, 5, 10, 11, 15, 25, 30, 30, 35"
      },
      {
        prompt: "Organized tours to remote areas and communities are increasingly popular. Is it a positive or negative development for the local people and the environment?"
      }
    ]
  },
  {
    id: 12,
    title: "Test 12",
    tags: ["Maps", "Urban Planning", "Infrastructure", "Agree or Disagree", "Health", "Public Spending"],
    tasks: [
      {
        prompt: "The maps below show Hunderstone town at present and a proposed plan for it.",
        imageUrl: "https://i.postimg.cc/Bv1bqKS3/IETLS-Writing-recent-actual-test-16.jpg",
        keyInformation: "The maps illustrate a number of proposed changes that are to take place in the town of Hunderstone.\n\nIn general, while the area to the east of the railway will remain almost the same, the western side is going to undergo several significant changes, especially with regards to the transport infrastructure.\n\nAs can be seen in the first map, Hunderstone Town is currently divided into two main areas by a railway line, which runs from north to south and passes by a gas station. To the west of the railway, there is an air field which is connected to the main road (A1). A roundabout in the middle of this road connects the A1 road to the east of the town, and in particular, to the ring road around the town centre.\n\nIn the future, the airfield in the north west of Hunderstone Town is expected to be replaced by an industrial estate. A new railway line will also be constructed to provide further access to this area. In addition, a new, larger roundabout will be constructed midway along the road connecting the east and west of the town. A new road (A4) which will connect the A1 to the town centre will also be built in the south of the town."
      },
      {
        prompt: "It is more important to spend public money promoting a healthy lifestyle in order to prevent illness than to spend it on the treatment of people who are already ill. To what extent do you agree or disagree?"
      }
    ]
  },
  {
    id: 13,
    title: "Test 13",
    tags: ["Table", "Health", "Weight", "Causes and Problems", "Society"],
    tasks: [
      {
        prompt: "The table below shows the weight of people in a particular country from 1999 to 2009.",
        imageUrl: "",
        keyInformation: "Chart title: Weight of People in a Country (1999-2009)\nColumns:\n- Women: [1999, 2004, 2009]\n- Men: [1999, 2004, 2009]\nRows:\n1 Under weight, values: 27%, 29%, 28%, 22%, 20%, 23%\n2 Normal weight, values: 49%, 51%, 47%, 41%, 48%, 47%\n3 Over weight, values: 18%, 21%, 19%, 30%, 23%, 19%"
      },
      {
        prompt: "These days people in some countries are living in a “throw-away” society which means people use things in a short time then throw them away. Causes and problems."
      }
    ]
  },
  {
    id: 14,
    title: "Test 14",
    tags: ["Line Graph", "Employment", "Women", "Agree or Disagree", "Environment", "Wildlife"],
    tasks: [
      {
        prompt: "The line graph below gives information about the percentage of women aged 15-64 in employment between 2003 and 2009.",
        imageUrl: "https://i.postimg.cc/Gms2JyWc/percentage-of-women-aged-15-64-in-employment-2003-2009.png",
        keyInformation: "Chart title: Percentage of Women Aged 15-64 in Employment (2003-2009)\nCategories (X-Axis): 2003, 2005, 2007, 2009\nX Axis Label: Year\nY Axis Label: Percentage (%)\nData series:\n1 Iceland, values: 81, 81, 80, 78\n2 Canada, values: 69, 69, 70, 70\n3 Germany, values: 59, 60, 61, 62\n4 Chile, values: 35, 39, 40, 41\n5 Turkey, values: 25, 21, 22, 24"
      },
      {
        prompt: "Some people think that a huge amount of time and money is spent on the protection of wild animals, and that this money could be better spent on the human population. To what extent do you agree or disagree with this opinion?"
      }
    ]
  },
  {
    id: 15,
    title: "Test 15",
    tags: ["Bar Chart", "Media", "Sales", "Agree or Disagree", "Urbanisation", "Countryside"],
    tasks: [
      {
        prompt: "The chart below shows the number of magazines sold per person in five countries in 2000 and 2010, with projected sales for 2020.",
        imageUrl: "https://i.postimg.cc/SRjbGx63/number-of-magazines-sold-per-person-in-five-countries-2000-2020.png",
        keyInformation: "Chart title: Number of Magazines Sold Per Person in Five Countries (2000-2020)\nCategories (X-Axis): Country A, Country B, Country C, Country D, Country E\nX Axis Label: Countries\nY Axis Label: Number of magazines sold per person\nData series:\n1 2000, values: 49, 50, 37, 18, 5\n2 2010, values: 45, 47, 35, 19, 7\n3 2020, values: 38, 45, 33, 23, 5"
      },
      {
        prompt: "Traffic and housing problems could be solved by moving large companies, factories and their employees to the countryside. Do you agree or disagree?"
      }
    ]
  },
  {
    id: 16,
    title: "Test 16",
    tags: ["Table", "Energy", "Oil Production", "Advantages & Disadvantages", "Lifestyle", "Family"],
    tasks: [
      {
        prompt: "The table below shows daily oil production in 4 countries from 2000 to 2004.",
        imageUrl: "https://i.postimg.cc/sft3J5Lp/daily-oil-production-in-4-countries-2000-2004-barrels-per-day.png",
        keyInformation: "Chart title: Daily Oil Production in 4 Countries (2000-2004) (barrels per day)\nCategories (X-Axis): 2000, 2001, 2002, 2003, 2004\nX Axis Label: \nY Axis Label: \nData series:\n1 Nigeria, values: 205000, 201000, 190000, 210000, 213000\n2 Chad, values: 0, 0, 0, 8000, 50000\n3 Congo, values: 275000, 234000, 222000, 215000, 203000\n4 Somalia, values: 5000, 8000, 17000, 21000, 50000"
      },
      {
        prompt: "In many places, people’s lifestyles are changing rapidly, and this aﬀects family relationships. Do you think the advantages of such developments outweigh the disadvantages?"
      }
    ]
  },
  {
    id: 17,
    title: "Test 17",
    tags: ["Bar Chart", "Transport", "Population", "Positive or Negative", "Shopping"],
    tasks: [
      {
        prompt: "The chart below shows the number of passengers who used public transport in Somewhere town from 2012 to 2015.",
        imageUrl: "https://i.postimg.cc/9F5j9CRf/number-of-public-transport-passengers-in-somewhere-town-2012-2015.png",
        keyInformation: "Chart title: Japan's Population by Age Groups (1960-2040)\nCategories (X-Axis): 1960, 1970, 1980, 1990, 2000, 2010, 2020, 2030, 2040\nX Axis Label: Year\nY Axis Label: Population (%)\nData series:\n1 0-14, values: 30, 35, 28, 29, 20, 18, 15, 12, 10\n2 25-64, values: 65, 70, 68, 70, 68, 65, 60, 55, 57\n3 65+, values: 5, 5, 10, 11, 15, 25, 30, 30, 35"
      },
      {
        prompt: "Large shopping malls are replacing small shops. Do you think it is a positive or negative development?"
      }
    ]
  },
  {
    id: 18,
    title: "Test 18",
    tags: ["Table", "Population", "Cities", "Discussion (Both Views)", "Education", "University"],
    tasks: [
      {
        prompt: "The table below compares actual and predicted figures for populations in three diﬀerent cites.",
        imageUrl: "https://i.postimg.cc/xTSWC57p/actual-and-predicted-populations-in-three-cities.png",
        keyInformation: "Chart title: Actual and Predicted Populations in Three Cities\nColumns:\n- Sao Paulo\n- Jakarta\n- Shanghai\nRows:\n1 Actual population 1990, values: 15, 9.5, 13.5\n2 Predicted population 2000, values: 24, 14, 17\n3 Actual population 2000, values: 18, 11.5, 12.5"
      },
      {
        prompt: "Many people say that universities should only oﬀer places to young students with the highest marks, while others say they should accept people of all ages, even if they did not do well at school. Discuss both views and give your own opinion."
      }
    ]
  },
  {
    id: 19,
    title: "Test 19",
    tags: ["Bar Chart", "Housing", "Construction", "Agree or Disagree", "Education", "Government Spending"],
    tasks: [
      {
        prompt: "The bar chart below shows the number of houses built per year in two cities, Derby and Nottingham, between 2000 and 2009.",
        imageUrl: "https://i.postimg.cc/44pSrtdr/number-of-houses-built-in-derby-and-nottingham-2000-2009.png",
        keyInformation: "Chart title: Number of Houses Built in Derby and Nottingham (2000-2009)\nCategories (X-Axis): 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009\nX Axis Label: Year\nY Axis Label: Number of houses\nData series:\n1 Derby, values: 40, 40, 80, 120, 120, 120, 120, 120, 270, 340\n2 Nottingham, values: 50, 60, 20, 50, 70, 80, 10, 190, 20, 250"
      },
      {
        prompt: "Education for young people is important in many countries. However, some people think that the government should spend more money on education in adult populations who cannot read and write. To what extent do you agree or disagree?"
      }
    ]
  },
  {
    id: 20,
    title: "Test 20",
    tags: ["Line Graph", "Environment", "Pollution", "Advantages & Disadvantages", "University", "Family"],
    tasks: [
      {
        prompt: "The graph below shows UK air pollutants in millions of tonnes, from three diﬀerent sources, between 1990 and 2005.",
        imageUrl: "https://i.postimg.cc/Fs9D8BwH/uk-air-pollutants-by-source-1990-2005.png",
        keyInformation: "Chart title: UK Air Pollutants by Source (1990-2005)\nCategories (X-Axis): 1990, 1993, 1996, 1999, 2002, 2005\nX Axis Label: Year\nY Axis Label: Million tonnes\nData series:\n1 Total, values: 7.8, 7.6, 6.8, 6.2, 5.6, 4.9\n2 Industry, values: 5.8, 5, 4.8, 4, 2.5, 2\n3 Transport, values: 1, 1.5, 1, 1.2, 2.7, 3\n4 Households, values: 1, 1, 1, 1, 0.5, 0"
      },
      {
        prompt: "Many university students live with their families, while others live away from home because their universities are in different places. What are the advantages and disadvantages of both situations?"
      }
    ]
  },
  {
    id: 21,
    title: "Test 21",
    tags: ["Bar Chart", "Energy Production", "France"],
    tasks: [
      {
        prompt: "The chart below shows a comparison of diﬀerent kinds of energy production in France in 1995 and 2005.",
        imageUrl: "https://i.postimg.cc/yd4Zw478/energy-production-in-france-1995-and-2005.png",
        keyInformation: `
Chart title: Energy Production in France (1995 and 2005)
Categories (X-Axis): 1995, 2005
X Axis Label: 
Y Axis Label: 
Data series:
1 Gas, values: 29.63, 30.31
2 Coal, values: 29.8, 30.93
3 Petro, values: 29.27, 19.55
4 Nuclear, values: 6.4, 10.1
5 Other, values: 4.9, 9.1
`
      },
      {
        prompt: "Task 2 for this test has not been provided. Please select another test for Task 2 practice."
      }
    ]
  }
];
