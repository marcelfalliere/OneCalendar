package dao

import dao.configuration.injection.MongoProp.MongoDbName
import org.scalatest.{BeforeAndAfterAll, BeforeAndAfter, FunSuite}
import com.mongodb.casbah.TypeImports._
import com.mongodb.casbah.MongoConnection

trait MongoDbConnection extends FunSuite with BeforeAndAfter with BeforeAndAfterAll {
    implicit val dbName: MongoDbName = "test"
    
    val connection: MongoConnection = MongoConnection()

    val db = {
        val db: MongoDB = connection("test")
        db
    }

    implicit val mongoConfigurationTesting = (name:String) => {
        val collection: MongoCollection = db(name)
        collection
    }

    before {
        mongoConfigurationTesting("events").drop()
    }

    override def afterAll {
        connection.close()
    }
}