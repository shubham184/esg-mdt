const _ = require('lodash');

const config = {
    "variables": [
      {
        "name": "gender",
        "type": "Fixed Array",
        "length": 4,
        "elements": ["Male", "Female", "Other", "Not Disclosed"],
        "description": "Fixed array of gender categories"
      },
      {
        "name": "country",
        "type": "Input Dynamic Array",
        "length": null,
        "elements": null,
        "description": "User-provided dynamic array of country names. Length and elements are determined based on input data."
      },
      {
        "name": "employeeData",
        "type": "Input Array of Arrays",
        "length": null,
        "elements": null,
        "description": "User-provided multidimensional array with tuples of (country, gender, employee count). The structure and length vary based on input data."
      }
    ],
    "outputs": [
      {
        "name": "globalGenderPercentage",
        "description": "Calculate the global percentage of employees for each gender",
        "formula": "Sum of each gender count across all countries / Total count of all employees"
      },
      {
        "name": "genderPercentageByCountry",
        "description": "Calculate the percentage of each gender within each country",
        "formula": "Count of each gender in a country / Total count of employees in that country"
      }
    ]
  };

// Sample data
const employeeData = [
    ['Belgium', 97, 167, 117, 153],
    ['Netherlands', 59, 71, 86, 137],
    ['France', 120, 138, 190, 108],
    ['Germany', 89, 137, 138, 131]
  ];
  

const genderVariable = config.variables.find(variable => variable.name === 'gender');
const genders = genderVariable ? genderVariable.elements : [];


function convertToEmployeeNumbers(employeeData, genders) {
  return _.fromPairs(employeeData.map(([country, ...counts]) => [country, _.zipObject(genders, counts)]));
}

// Calculate global gender percentage
function calculateGlobalGenderPercentage(employeeNumbers) {
  const totalsByGender = _.reduce(employeeNumbers, (result, countryData) => {
    _.forEach(countryData, (count, gender) => {
      result[gender] = (result[gender] || 0) + count;
    });
    return result;
  }, {});

  const grandTotal = _.sum(_.values(totalsByGender));
  return _.mapValues(totalsByGender, count => (count / grandTotal) * 100);
}

// Calculate gender percentage by country
function calculateGenderPercentageByCountry(employeeNumbers) {
  return _.mapValues(employeeNumbers, countryData => {
    const totalInCountry = _.sum(_.values(countryData));
    return _.mapValues(countryData, count => (count / totalInCountry) * 100);
  });
}


function executeCalculationsFromConfig(jsonConfig, employeeNumbers) {
    let results = {};

    jsonConfig.outputs.forEach(output => {
        switch (output.name) {
            case 'globalGenderPercentage':
                results.globalGenderPercentage = calculateGlobalGenderPercentage(employeeNumbers);
                break;
            case 'genderPercentageByCountry':
                results.genderPercentageByCountry = calculateGenderPercentageByCountry(employeeNumbers);
                break;
        }
    });

    return results;
}


const employeeNumbers = convertToEmployeeNumbers(employeeData, genders);
const calculationResults = executeCalculationsFromConfig(config, employeeNumbers);
console.log('Global Gender Percentage:');
console.table(calculationResults.globalGenderPercentage);

console.log('Gender Percentage by Country:');
Object.entries(calculationResults.genderPercentageByCountry).forEach(([country, percentages]) => {
    console.log(`\n${country}:`);
    console.table(percentages);
});
