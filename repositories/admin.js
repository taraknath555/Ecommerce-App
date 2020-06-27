const fs = require('fs')
const crypto = require('crypto')

class adminRepository {
  constructor(filename){
    if(!filename){
      throw new Error('Creating a repository requires a filename.')
    }
    this.filename = filename;
    
    try{
      fs.accessSync(this.filename)
    }catch(err){
      if(err) fs.writeFileSync(this.filename, '[]')
    }
  }
  
  async getAll(){
    return JSON.parse(
      await fs.promises.readFile(this.filename, {
        encoding : 'utf8'
      })
    )
  }

  async getOne(id){
    const records = await this.getAll()
    return records.find(record => record.id === id)
  }

  async getOneBy(filters){
    const records = await this.getAll()
    for(let record of records){
      let found = true
      for(let key in filters){
        if(record[key] !== filters[key]){
          found = false
        }
      }
      if(found) return record;
    }
  }

  async writeAll(records){
    await fs.promises.writeFile(
      this.filename,
      JSON.stringify(records,null,2)
    );
  }

  async create(attrs){
    const records = await this.getAll()
    attrs['id'] = this.randomId()
    records.push(attrs)
    await this.writeAll(records)
  }

  async delete(id){
    const records = await this.getAll()
    const filteredRecords = records.filter(record => record.id !== id)
    await this.writeAll(filteredRecords)
  }

  async update(id,attrs){
    const records = await this.getAll()
    const record = records.find(record => record.id === id)
    if(!record) throw new Error(`Id '${id}' not found`)
    Object.assign(record,attrs)
    await this.writeAll(records)
  }

  randomId(){
    return crypto.randomBytes(6).toString('hex')
  } 

}

module.exports = new adminRepository('admin.json')