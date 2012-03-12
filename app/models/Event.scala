package models

import org.joda.time.DateTime

case class Event( title: String,
                  begin: DateTime,
                  end: DateTime,
                  location: String = "",
                  description: String = "",
                  tags: List[String] = Nil
)