class APIFeatures {
    constructor(query, queryString) {
      this.query = query;
      this.queryString = queryString;
    
    }
    filter() {
      // 1A) Filtering
      const keys = Object.keys(this.queryString);
      let queryObj = {};
      keys.forEach(el => {
        queryObj[el] = this.queryString[el]
      });
      
      

      
      // 
      
      const excludedFields = ['page', 'sort', 'limit', 'fields'];
      excludedFields.forEach((el) => delete queryObj[el]);
      
      
  
      // 1B) Advanced filtering
      let queryStr = JSON.stringify(queryObj);
      queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

      this.query = this.query.find(JSON.parse(queryStr));

return this;    }
    sort() {
      if (this.queryString.sort) {
        // Making the string readable
     

        const sortBy = this.queryString.sort.split(',').join(' ');

        // Using mongoose
        
        this.query = this.query.sort(sortBy);
  
        //sort('price ratingAverage')
      }
      // In case there is no sorting we will stil sort them by creationDate
      else {
        this.query = this.query.sort('-createdAt');
      }
      return this;
    }
    field() {
      if (this.queryString.fields) {
        const fields = this.queryString.fields.split(',').join(' ');
  
        this.query = this.query.select(fields);
      } else {
        // excluding __v
        this.query = this.query.select('-__v');
      }
      return this;
    }
    paginate() {
      // CONVERTING THE URL STRING TO NUMBER WITH THIS TRICK
      const page = this.queryString.page * 1 || 1;
      const limit = this.queryString.limit * 1 || 100;
      const skip = (page - 1) * limit;
      //onsole.log(`Here baby: ${skip}`);
  
      // page=2&limit=50 1-10 PAGE1, 11-20 PAGE 2
      this.query = this.query.skip(skip).limit(limit);
      return this;
    }
  }


module.exports = APIFeatures;